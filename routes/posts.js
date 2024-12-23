import { Router } from "express";
import { body, param } from "express-validator";
import { createPost, getAllPosts, likePost, unlikePost } from "../controllers/posts.js";
import { verifyPostExists } from "../middleware/post.js";
import { uploadMiddlewareGenerator } from "../middleware/upload.js";

/**
 * @swagger
 * components:
 *  schemas:
 *    Post:
 *      type: object
 *      required:
 *        - title
 *        - videoUrl
 *        - thumbnailUrl
 *        - userId
 *      properties:
 *        id:
 *          type: string
 *        title:
 *          type: string
 *        videoUrl:
 *          type: string
 *        thumbnailUrl:
 *          type: string
 *        userId:
 *          type: string
 *
 * tags:
 *  name: Posts
 *  description: Post management API
 * /posts:
 *  get:
 *    summary: List all posts based on filter criteria
 *    tags: [Posts]
 *    responses:
 *      200:
 *        description: List of all books
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 * /posts/{id}/like:
 *  put:
 *    summary: Like a post
 *    tags: [Posts]
 *    responses:
 *      200:
 *        description: Post like successful
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */

const router = Router();

router.get("/", getAllPosts);
router.post(
  "/",
  uploadMiddlewareGenerator([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  body("title").notEmpty().isLength({ min: 3, max: 64 }),
  createPost
);
router.put("/:id/like", param("id").notEmpty(), verifyPostExists, likePost);
router.put("/:id/unlike", param("id").notEmpty(), verifyPostExists, unlikePost);

export { router as PostRouter };
