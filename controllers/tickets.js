import { validationResult } from "express-validator";
import { Ticket } from "../models/ticket.js";

const PAGE_LIMIT = 10;

export const getAllTickets = async (req, res) => {
  try {
    const tickets = Ticket.find();
    let { latest = false, page = 0, limit = PAGE_LIMIT, search = null } = req.query;

    if (latest && latest.trim()) {
        tickets.sort({ createdAt: "desc" });
    }

    if (search && search.trim()) {
        tickets.where("title").regex(new RegExp(search, "gi"));
    }

    limit = +limit ? Number(limit) : PAGE_LIMIT;
    limit = Math.min(PAGE_LIMIT, Math.max(limit, 1));
    tickets.limit(limit);

    page = +page ? Number(page) : 0;
    tickets.skip(page * limit);

    return res.json({ tickets: await tickets.populate("user").exec(), page });
  } catch (error) {
    console.error("getAllTickets", error);
    return res.status(500).json({ message: "An error occurred while fetching tickets" });
  }
};

export const createTicket = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid input" });
  }

  const { title, description } = req.body;

  try {
    let ticket = new Ticket({ title, description, user: req.currentUser._id });
    ticket = await ticket.save();
    return res.status(201).json({ ticket, message: "Ticket created successfully" });
  } catch (error) {
    console.error("createTicket", error);
    return res.status(500).json({ message: "An error occurred while creating ticket" });
  }
};