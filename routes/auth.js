import { Router } from "express";
import { body, param } from "express-validator";
import { confirm, confirmViaOTP, login, logout, me, register, requestConfirmation } from "../controllers/auth.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();
router.post(
  "/register",
  body("name").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 40 }),
  body("passwordConfirmation").custom((value, { req }) => value === req.body.password),
  register
);
router.post("/confirm", body("email").isEmail(), requestConfirmation);
router.post("/confirm/otp", body("email").isEmail(), body("otp").trim().isNumeric().isLength({ min: 6, max: 6 }), confirmViaOTP);
router.get("/confirm/:token", param("token").trim().notEmpty(), confirm);
router.post("/login", body("email").isEmail(), body("password").isLength({ min: 6, max: 40 }), login);
router.delete("/logout", verifyAuth, logout);
router.get("/me", verifyAuth, me);

export { router as AuthRouter };
