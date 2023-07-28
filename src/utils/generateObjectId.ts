import { Types } from "mongoose";
export default function generateObjectId() {
  return new Types.ObjectId();
}