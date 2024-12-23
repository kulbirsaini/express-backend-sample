import { validationResult } from "express-validator";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ message: "Invalid input" });
  }

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already registered. Please login instead." });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);
    let user = new User({ name, email, password: encryptedPassword });
    user = await user.save();

    await user.generateConfirmationToken();

    return res.status(201).json({ message: "Registration successful. Please check your email to confirm the account." });
  } catch (error) {
    console.error("register", error);
    return res.status(422).json({ message: "Failed to register. Please try again." });
  }
};

export const requestConfirmation = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).send("Invalid input.");
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ message: "Email is not registered. Please sign up instead." });
    }

    if (user.confirmed) {
      return res.status(422).json({ message: "Email is already confirmed. Please try to login instead." });
    }

    if (user.hasValidConfirmationToken()) {
      //TODO: Trigger confirmation email
      return res.json({ message: "Confirmation request registered. Please check your email to confirm the account." });
    }

    await user.generateConfirmationToken();
    return res.json({ message: "Confirmation request registered. Please check your email to confirm the account." });
  } catch (error) {
    console.error("requestConfirmation", error);
    return res.status(422).json({ message: "An error occurred while requesting confirmation token." });
  }
};

export const confirm = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(401).send("Invalid confirmation token.");
  }

  const { token } = req.params;
  try {
    await User.confirmUserWithConfirmationToken(token);
    return res.send("Email confirmed successfully. Please continue to the app.");
  } catch (error) {
    console.error("confirm", token, error);
    return res.status(401).send("Invalid confirmation token. Please request another confirmation email via app.");
  }
};

export const confirmViaOTP = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(401).json({ message: "Invalid OTP." });
  }

  const { email, otp } = req.body;
  try {
    await User.confirmUserWithOtp(email, otp);
    return res.json({ message: "Email confirmed successfully." });
  } catch (error) {
    console.error("confirmViaOTP", email, error);
    return res.status(401).json({ message: "Invalid OTP. Please request another confirmation email." });
  }
};

export const login = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (!user.confirmed) {
      return res
        .status(401)
        .json({ message: "Email is not confirmed. Please check your email and confirm before you can login." });
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      throw new Error("Invalid email or password.");
    }

    const authToken = await user.createAndSaveAuthToken();
    return res.json({ user, authToken });
  } catch (error) {
    console.error("login", error);
    return res.status(401).json({ message: "Invalid email or password." });
  }
};

export const logout = async (req, res, next) => {
  if (!req?.currentUser || !req?.authToken) {
    return res.json({ message: "Logged out successfully." });
  }

  try {
    await req.currentUser.removeAuthToken(req.authToken);
    return res.json({ user: null, authToken: null });
  } catch (error) {
    console.error("logout", error);
    return res.status(500).json({ message: "An error occurred while logging out" });
  }
};

export const me = async (req, res, next) => {
  if (req?.currentUser) {
    if (!req.currentUser.confirmed) {
      return res
        .status(401)
        .json({ message: "Email is not confirmed. Please check your email and confirm before you can login." });
    }

    return res.json({ user: req.currentUser });
  }

  return res.status(401).json({ message: "Unauthorized access." });
};
