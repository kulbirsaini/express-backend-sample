import { Router } from "express";
import { body, param } from "express-validator";
import { createPost, getAllPosts, likePost, unlikePost } from "../controllers/posts.js";
import { verifyPostExists } from "../middleware/post.js";
import { uploadMiddlewareGenerator } from "../middleware/upload.js";

const router = Router();

router.get("/", getAllPosts);
router.post(
  "/",
  uploadMiddlewareGenerator([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  body("title").notEmpty().isLength({ min: 3, max: 64 }),
  body("prompt").notEmpty().isLength({ min: 3, max: 255 }),
  createPost
);
router.put("/:id/like", param("id").notEmpty(), verifyPostExists, likePost);
router.put("/:id/unlike", param("id").notEmpty(), verifyPostExists, unlikePost);

export { router as PostRouter };
