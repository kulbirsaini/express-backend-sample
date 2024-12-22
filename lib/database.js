import mongoose from "mongoose";

export const database = () => mongoose.connect(process.env.MONGODB_URI);
