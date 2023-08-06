import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";

export default function verifyUser(req: any, res: Response, next: NextFunction) {
  const accessToken = (req.cookies.accessToken) ? req.cookies.accessToken : req.body.accessToken;
  if(!accessToken) return res.status(401).send("Unauthorized");
  try {
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY as string);
    req.local = {
      userId: (decoded as any)._id,
    }
    return next();

  } catch(error: any) {
    next(new AppError("Unauthorized", 401))
  }
}