import { User } from "../models/user.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.trim()?.replace("Bearer ", "")?.trim();
    if (!token) {
      throw new Error("Missing authorization token.");
    }

    const user = await User.validateAuthToken(token);
    req.authToken = token;
    req.userTokens = user.tokens;
    req.currentUser = user;
    next();
  } catch (error) {
    console.error("verifyAuth", error);
    return res.status(401).json({ message: "Unathorized access." });
  }
};
