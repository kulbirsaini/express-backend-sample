import { validationResult } from "express-validator";
import { sendEmail } from "../lib/mailer.js";

export const deliverEmail = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid input" });
  }

  const { email, subject, body } = req.body;

  try {
    await sendEmail({ to: email, subject, html: body, text: body, from: process.env.FROM_EMAIL_ADDRESS });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("delierEmail", error);
    return res.status(500).json({ message: "An error occurred while sending email" });
  }
};