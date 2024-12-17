import express, { Router } from "express";
import { AuthRouter } from "../routes/auth.js";
import bodyParser from "body-parser";
import { PostRouter } from "../routes/posts.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { MulterError } from "multer";

const router = Router();
router.use("/hello", (req, res, next) => {
  res.send("hello!");
});

export const app = express();
app.use(bodyParser.json());
app.use(router);
app.use(AuthRouter);
app.use("/posts", verifyAuth, PostRouter);
app.use((error, req, res, next) => {
  console.error("Global error handler", error);
  return res.status(500).json({ message: "An unknown error occurred" });
});

app.listen(3000);
