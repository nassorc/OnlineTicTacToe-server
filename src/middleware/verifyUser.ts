import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function verifyUser(req: Request, res: Response, next: NextFunction) {
    return next();
}