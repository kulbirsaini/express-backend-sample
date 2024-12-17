import { ID } from "node-appwrite";
import { account, appwriteConfig, avatars, databases, getUserByAccountId } from "../lib/appwrite.js";
import { getToken } from "../lib/jwt.js";
import { validationResult } from "express-validator";

export const register = async (req, res, next) => {
  console.log("POST /register");

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(401).json({ message: "Bad request" });
  }

  try {
    const { username, email, password } = req.body;

    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) {
      throw new Error("Failed to create new account.");
    }

    const authToken = getToken(newAccount.$id);
    if (!authToken) {
      throw new Error("Failed to generate token");
    }

    await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), {
      accountId: newAccount.$id,
      email,
      username,
      avatar: avatars.getInitials(username),
      tokens: [authToken],
    });

    const user = await getUserByAccountId(newAccount.$id);
    return res.json({ user, authToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Failed to register" });
  }
};

export const login = async (req, res, next) => {
  console.log("POST /login", req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { email, password } = req.body;
  try {
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) {
      throw new Error("Failed to login");
    }

    const currentUser = await getUserByAccountId(session.userId);
    if (!currentUser) {
      throw new Error("Could not find user");
    }

    const authToken = getToken(session.userId);
    if (!authToken) {
      throw new Error("Failed to generate token");
    }
    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, currentUser.$id, {
      tokens: [...currentUser.tokens, authToken],
    });

    const newUser = { ...currentUser, tokens: [authToken] };
    return res.json({ user: newUser, authToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid email or password" });
  }
};

export const logout = async (req, res, next) => {
  console.log("DELETE /logout", req.body);

  if (!req.currentUser || !req.authToken) {
    return res.status(200).json({ message: "Logged out successfully." });
  }

  try {
    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, req.currentUser.$id, {
      tokens: (req.userTokens || []).filter((token) => token !== req.authToken),
    });

    return res.json({ user: null, authToken: null });
  } catch (error) {
    console.error("logout", error);
    return res.status(500).json({ message: "An error occurred while logging out" });
  }
};

export const me = async (req, res, next) => {
  console.log("GET /me", req.body);

  if (req?.currentUser) {
    return res.json({ user: req.currentUser });
  }

  return res.status(401).json({ message: error.message });
};
