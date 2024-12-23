import jwt from "jsonwebtoken";

export const getToken = (content, expiresIn = "7d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in creating token");
  }

  if (!content) {
    throw new Error("Invalid token content");
  }

  return jwt.sign(content, process.env.JWT_SECRET, { expiresIn });
};

export const decodeToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Error in decoding token");
  }

  if (!token) {
    throw new Error("Invalid token");
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

const generateOtp = (limit) => {
  // Credit: https://onecompiler.com/javascript/433t3xpju
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < limit; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateOtpToken = () => {
  const otp = generateOtp(6);
  return getToken({ otp: otp }, "15m");
};
