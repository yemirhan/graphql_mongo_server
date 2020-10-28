import { ObjectId } from "mongodb";
import { redis } from "../redis";
import { v4 } from "uuid";
import { confirmUserPrefix } from "../constants/redisPrefixes";
export const createConfirmationUrl = async (userId: ObjectId) => {
  const token = v4();
  await redis.set(
    confirmUserPrefix + token,
    new ObjectId(userId).toString(),
    "ex",
    60 * 60 * 24
  );

  return `http://localhost:300/confirm/${token}`;
};
