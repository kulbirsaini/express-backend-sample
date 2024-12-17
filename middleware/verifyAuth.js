import { getUserByAccountId } from "../lib/appwrite.js";
import { getAccountIdFromToken } from "../lib/jwt.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.trim()?.replace("Bearer ", "")?.trim();
    if (!token) {
      throw new Error("Missing authorization token");
    }

    const { id, exp } = getAccountIdFromToken(token);
    if (!id || exp > new Date()) {
      throw new Error(`Invalid or expired token. ID: ${id} Exp: ${exp}`);
    }

    const user = await getUserByAccountId(id);
    if (!user) {
      throw new Error("Could not find user");
    }

    if (!user.tokens.includes(token)) {
      throw new Error("Invalid authorization token");
    }

    req.authToken = token;
    req.userTokens = user.tokens;
    req.currentUser = { ...user, tokens: [] };
    next();
  } catch (error) {
    console.error("verifyAuth", error);
    return res.status(401).json({ message: "Unathorized access" });
  }
};
