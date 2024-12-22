import { validationResult } from "express-validator";
import { Post } from "../models/post.js";

export const verifyPostExists = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(404).json({ message: "Invalid post id" });
  }

  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return res.status(404).json({ message: "Invalid post id" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    req.currentPost = post;
    next();
  } catch (error) {
    console.error("verifyPostExists", error);
    return res.status(500).json({ message: "An error occured while loading post" });
  }
};
