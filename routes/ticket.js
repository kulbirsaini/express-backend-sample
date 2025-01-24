import { Router } from "express";
import { body } from "express-validator";
import { createTicket, getAllTickets } from "../controllers/tickets.js";

const router = Router();

router.get("/", getAllTickets);
router.post(
  "/",
  body("title").notEmpty().isLength({ min: 3, max: 128 }),
  body("description").notEmpty().isLength({ min: 8 }),
  createTicket
);

export { router as TicketRouter };
