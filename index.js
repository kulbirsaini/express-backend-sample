import { serverless } from "serverless-http";
import { app } from "./api/index.js";

module.exports.handler = serverless(app);