import { ObjectId } from "mongodb";
import { redis } from "../redis";
import { v4 } from "uuid";
import { forgotPasswordPrefix } from "../constants/redisPrefixes";
export const createForgotPasswordUrl = async (userId: ObjectId) => {
  const token = v4();
  await redis.set(
    forgotPasswordPrefix + token,
    new ObjectId(userId).toString(),
    "ex",
    60 * 60 * 24
  );

  return `http://localhost:300/forgot-password/${token}`;
};
