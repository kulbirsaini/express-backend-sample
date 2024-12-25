import { Router } from "express";
import { generateAvatar, me } from "../controllers/user.js";

const router = Router();
router.get("/me", me);
router.post("/random-avatar", generateAvatar);

export { router as UserRouter };
