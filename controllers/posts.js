import { Query } from "node-appwrite";
import { appwriteConfig, databases, createNewPost } from "../lib/appwrite.js";
import { validationResult } from "express-validator";

const MIN_POST_LIMIT = 1;
const MAX_POST_LIMIT = 10;

export const getAllPosts = async (req, res, next) => {
  console.log("GET /posts", req.query);

  try {
    let { latest = false, limit = 10, search = null, scope = null, userId = null } = req.query;
    const queries = [];

    if (scope === "saved") {
      if (!req.currentUser.savedVideos || !req.currentUser.savedVideos.length) {
        return res.status(200).json({ posts: [] });
      }

      queries.push(Query.contains("$id", req.currentUser.savedVideos));
    } else if (scope === "user") {
      if (!userId || !userId.trim()) {
        return res.status(404).json({ posts: [] });
      }

      queries.push(Query.equal("creator", userId));
      queries.push(Query.orderDesc("$createdAt"));
    }

    limit = Number(limit);
    if (limit > MAX_POST_LIMIT) {
      limit = MAX_POST_LIMIT;
    } else if (limit < MIN_POST_LIMIT) {
      limit = MIN_POST_LIMIT;
    }
    queries.push(Query.limit(limit));

    if (latest && latest.trim()) {
      queries.push(Query.orderDesc("$createdAt"));
    }

    if (search && search.trim()) {
      queries.push(Query.search("title", search));
    }

    const posts = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, queries);
    return res.json({ posts: posts.documents });
  } catch (error) {
    console.error("getAllPosts", error);
    return res.status(500).json({ message: "An error occurred while fetching posts" });
  }
};

export const createPost = async (req, res, next) => {
  console.log("POST /posts");

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid input" });
  }

  const { title, prompt } = req.body;
  const { video, thumbnail } = req.files;
  if (!video || !thumbnail) {
    return res.status(422).json({ message: "Missing files" });
  }

  try {
    const post = await createNewPost({ title, prompt, video: video[0], thumbnail: thumbnail[0], userId: req.currentUser.$id });
    return res.status(200).json({ post, message: "Post created successfully" });
  } catch (error) {
    console.error("createPost", error);
    return res.status(500).json({ message: "An error occurred while creating post" });
  }
};

export const likePost = async (req, res, next) => {
  console.log("PUT /posts/:id/like", req.params);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Bad request" });
  }

  // If the video is already saved for this user
  if (req.currentUser.savedVideos && req.currentUser.savedVideos.includes(req.currentPost.$id)) {
    return res.status(200).json({ message: "Post liked", savedVideos: req.currentUser.savedVideos });
  }

  try {
    const savedVideos = [...req.currentUser.savedVideos, req.currentPost.$id.toString()];
    const user = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, req.currentUser.$id, {
      savedVideos,
    });
    return res.status(200).json({ message: "Post liked", savedVideos });
  } catch (error) {
    console.error("likePost", error);
    return res.status(500).json({ message: "An error occurred while liking post" });
  }
};

export const unlikePost = async (req, res, next) => {
  console.log("PUT /posts/:id/unlike", req.params);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Bad request" });
  }

  if (!req.currentUser.savedVideos || !req.currentUser.savedVideos.includes(req.currentPost.$id)) {
    return res.status(200).json({ message: "Post unliked", savedVideos: req.currentUser.savedVideos });
  }

  try {
    const postIdStr = req.currentPost.$id.toString();
    const savedVideos = req.currentUser.savedVideos.filter((savedVideoId) => savedVideoId !== postIdStr);
    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, req.currentUser.$id, {
      savedVideos,
    });
    return res.status(200).json({ message: "Post unliked", savedVideos });
  } catch (error) {
    console.error("unlikePost", error);
    return res.status(500).json({ message: "An error occurred while unliking post" });
  }
};
