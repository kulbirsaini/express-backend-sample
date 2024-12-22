import jwt from "jsonwebtoken";

export const getToken = (id, expiresIn = "7d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in creating token");
  }

  if (!id) {
    throw new Error("Invalid user id");
  }

  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn });
};

export const getUserIdFromToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in creating token");
  }

  if (!token) {
    throw new Error("Invalid authentication token");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

export const getTimeToLive = (expiry) => {
  // Get TTL in Seconds
  const date = new Date(expiry);
  const isTimestampInMilliSeconds = Math.abs(Date.now() - date) < Math.abs(Date.now() - date * 1000);
  const currentTimestamp = +new Date() / (isTimestampInMilliSeconds ? 1 : 1000);
  return isTimestampInMilliSeconds ? (expiry - currentTimestamp) / 1000 : expiry - currentTimestamp;
};

export const generateOtp = (limit) => {
  // Credit: https://onecompiler.com/javascript/433t3xpju
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < limit; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};
