import { ObjectId } from "mongodb";
// import { redis } from "../redis";
import { v4 } from "uuid";
export const createConfirmationUrl = (userId: ObjectId) => {
  const id = v4();
  console.log(id, userId);

  // redis.set(id, String(userId))
  return "dddd";
};
