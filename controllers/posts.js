import { validationResult } from "express-validator";
import { Post } from "../models/post.js";
import { uploadFile } from "../lib/imagekit.js";
import { isValidObjectId } from "mongoose";

const MIN_POST_LIMIT = 1;
const MAX_POST_LIMIT = 10;

export const getAllPosts = async (req, res) => {
  try {
    const posts = Post.find();
    let { latest = false, limit = 10, search = null, scope = null, userId = null } = req.query;

    if (scope === "liked") {
      if (!req.currentUser.likedPosts || !req.currentUser.likedPosts.length) {
        return res.status(200).json({ posts: [] });
      }

      posts.where("_id").in(req.currentUser.likedPosts);
    } else if (scope === "user") {
      if (!userId || !isValidObjectId(userId.trim())) {
        return res.status(404).json({ posts: [] });
      }

      posts.where("user").equals(userId.trim());
      posts.sort("createdAt");
    }

    limit = limit ? Number(limit) : MAX_POST_LIMIT;
    if (limit > MAX_POST_LIMIT) {
      limit = MAX_POST_LIMIT;
    } else if (limit < MIN_POST_LIMIT) {
      limit = MIN_POST_LIMIT;
    }
    posts.limit(limit);

    if (latest && latest.trim()) {
      posts.sort({ createdAt: "desc" });
    }

    if (search && search.trim()) {
      posts.where("title").regex(new RegExp(search, "gi"));
    }

    return res.json({ posts: await posts.populate("user").exec() });
  } catch (error) {
    console.error("getAllPosts", error);
    return res.status(500).json({ message: "An error occurred while fetching posts" });
  }
};

export const createPost = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid input" });
  }

  const { title } = req.body;
  const { video, thumbnail } = req.files;
  if (!video || !thumbnail) {
    return res.status(422).json({ message: "Missing files" });
  }

  try {
    const [videoUrl, thumbnailUrl] = await Promise.all([uploadFile(video[0]), uploadFile(thumbnail[0])]);

    let post = new Post({ title, thumbnailUrl, videoUrl, user: req.currentUser._id });
    post = await post.save();
    return res.status(201).json({ post, message: "Post created successfully" });
  } catch (error) {
    console.error("createPost", error);
    return res.status(500).json({ message: "An error occurred while creating post" });
  }
};

export const likePost = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid post id" });
  }

  // If the post is already liked by this user
  if (req.currentUser.likedPosts && req.currentUser.likedPosts.includes(req.currentPost._id)) {
    return res.status(200).json({ message: "Post liked", likedPosts: req.currentUser.likedPosts });
  }

  try {
    await req.currentUser.likePost(req.currentPost);
    return res.status(200).json({ message: "Post liked", likedPosts: req.currentUser.likedPosts });
  } catch (error) {
    console.error("likePost", error);
    return res.status(500).json({ message: "An error occurred while liking post" });
  }
};

export const unlikePost = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid post id" });
  }

  // If this post in user's liked posts, ignore
  if (!req.currentUser.likedPosts || !req.currentUser.likedPosts.includes(req.currentPost._id)) {
    return res.status(200).json({ message: "Post unliked", likedPosts: req.currentUser.likedPosts });
  }

  try {
    await req.currentUser.unlikePost(req.currentPost);
    return res.status(200).json({ message: "Post unliked", likedPosts: req.currentUser.likedPosts });
  } catch (error) {
    console.error("unlikePost", error);
    return res.status(500).json({ message: "An error occurred while unliking post" });
  }
};
