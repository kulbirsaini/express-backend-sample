import { Router } from "express";
import { body } from "express-validator";
import { deliverEmail } from "../controllers/emails.js";

const router = Router();

router.post(
  "/",
  body("email").isEmail(),
  body("subject").notEmpty(),
  body("body").notEmpty(),
  deliverEmail
);

export { router as EmailRouter };
