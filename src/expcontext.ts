import { Request, Response } from "express";
import { ObjectId } from "mongodb";
export interface ExpContext {
  req: Request;
  res: Response;
  payload?: { userid: ObjectId };
}
