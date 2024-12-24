import { validationResult } from "express-validator";
import { Post } from "../models/post.js";
import { uploadFile } from "../lib/imagekit.js";
import { isValidObjectId } from "mongoose";

const PAGE_LIMIT = 10;

export const getAllPosts = async (req, res) => {
  try {
    const posts = Post.find();
    let { latest = false, page = 0, limit = PAGE_LIMIT, search = null, scope = null, userId = null } = req.query;

    if (scope === "liked") {
      if (!req.currentUser.likedPosts || !req.currentUser.likedPosts.length) {
        return res.status(200).json({ posts: [], page });
      }

      posts.where("_id").in(req.currentUser.likedPosts);
    } else if (scope === "user") {
      if (!userId || !isValidObjectId(userId.trim())) {
        return res.status(404).json({ posts: [], page });
      }

      posts.where("user").equals(userId.trim());
      posts.sort("createdAt");
    }

    if (latest && latest.trim()) {
      posts.sort({ createdAt: "desc" });
    }

    if (search && search.trim()) {
      posts.where("title").regex(new RegExp(search, "gi"));
    }

    limit = +limit ? Number(limit) : PAGE_LIMIT;
    limit = Math.min(PAGE_LIMIT, Math.max(limit, 1));
    posts.limit(limit);

    page = +page ? Number(page) : 0;
    posts.skip(page * limit);

    return res.json({ posts: await posts.populate("user").exec(), page });
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
