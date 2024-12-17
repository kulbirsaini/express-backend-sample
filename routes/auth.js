import { Router } from "express";
import { body } from "express-validator";
import { login, logout, me, register } from "../controllers/auth.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.post(
  "/register",
  body("username").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 40 }),
  register
);

router.post("/login", body("email").isEmail(), body("password").isLength({ min: 6, max: 40 }), login);
router.delete("/logout", verifyAuth, logout);
router.get("/me", verifyAuth, me);

export { router as AuthRouter };
