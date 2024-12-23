import "dotenv/config";
import express, { Router } from "express";
import { AuthRouter } from "../routes/auth.js";
import bodyParser from "body-parser";
import { PostRouter } from "../routes/posts.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { database } from "../lib/database.js";
import morgan from "morgan";

const router = Router();
router.use("/hello", (req, res) => {
  res.send("hello hello!!");
});

export const app = express();
// Setup mongo db sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
  })
);
// Body parser for post requests
app.use(bodyParser.json());

// Request logging
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

app.use(router);
app.use("/auth", AuthRouter);
app.use("/posts", verifyAuth, PostRouter);
app.use((error, req, res, next) => {
  console.error("Global error handler", error);
  return res.status(500).json({ message: "An unknown error occurred" });
});

database()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server ready on port ${port}. Visit http://localhost:${port}/hello`));
  })
  .catch((error) => console.error(error));

export default app;
