import { Request, Response } from "express";
export interface ExpContext {
  req: Request;
  res: Response;
  payload?: { userId: string };
}
