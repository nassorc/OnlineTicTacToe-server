import express from "express";
import http from "http";
import socket from "./socket";
import router from "./routes";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
socket(server);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
router(app);

server.listen(PORT, async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    }
    catch(error: any) {
        throw new Error(error.message);
    }
});
