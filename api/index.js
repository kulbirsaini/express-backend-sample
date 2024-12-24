import "dotenv/config";
import express from "express";
import { AuthRouter } from "../routes/auth.js";
import bodyParser from "body-parser";
import { PostRouter } from "../routes/posts.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { database } from "../lib/database.js";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: null, // Avoid sending rate limit headers so that abusers won't know the actual allowed limit
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  statusCode: process.env.RATE_LIMIT_STATUS_CODE || 429, // Custom status code for bad actors
});

export const app = express();
app.set("trust proxy", 1 /* number of proxies between user and server */);

// Rate limiting
app.use(rateLimiter);

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

// Sample router
app.use("/hello", (req, res) => res.send("hello hello!!"));

// Get your IP address
app.get("/ip", (request, response) => response.send(request.ip));

// Authentication routes
app.use("/auth", AuthRouter);

// Protected routers below this. Must contain `verifyAuth` middleware
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
