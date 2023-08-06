import express, { Request, Response, NextFunction } from "express";
import http from "http";
import socket from "./socket";
import router from "./routes";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import log from "./lib/logger";
import "dotenv/config";
import {config} from "./config";

const PORT = config.API.PORT || 3000;
const app = express();
const server = http.createServer(app);
socket(server);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
router(app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  log.error(err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

server.listen(PORT, async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
  catch(error: any) {
    throw new Error(error.message);
  }
  console.log("=~=~=~=~=~=~=~=~=~=~=~=~=~")
  console.log("Database: \x1b[32mOnline");
  console.log("\x1b[0mServer: \x1b[32mOnline");
  console.log("\x1b[0mlink: " + config.API.URL);
});
