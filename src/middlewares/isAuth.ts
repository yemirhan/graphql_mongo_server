import { MiddlewareFn } from "type-graphql";

import { ExpContext } from "../expcontext";

export const isAuth: MiddlewareFn<ExpContext> = async ({ context }, next) => {
  if (!context.req.session!.userId) {
    throw new Error("not authenticated");
  }

  return next();
};
