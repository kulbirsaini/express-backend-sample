import jwt from "jsonwebtoken";

export const getToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in creating token");
  }

  if (!id) {
    throw new Error("Invalid user id");
  }

  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const getAccountIdFromToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in creating token");
  }

  if (!token) {
    throw new Error("Invalid authentication token");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};
