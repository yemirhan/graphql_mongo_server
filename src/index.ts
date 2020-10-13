import "dotenv/config";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import * as path from "path";
import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./object-id.scalar";
import mongoose from "mongoose";
import { UserResolver } from "./resolvers/UserResolver";
import { verify } from "jsonwebtoken";
import { UserModel } from "./entities/User";
import {
  createAccessToken,
  createRefreshToken,
} from "./auth/createRefreshToken";
(async () => {
  const app = express();
  await mongoose.connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    }),
  });
  apolloServer.applyMiddleware({ app, cors: false });
  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello");
  });
  app.post("/refresh_token", async (req: Request, res: Response) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: "" });
    }
    const user = await UserModel.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }
    res.cookie("jid", createRefreshToken(user), { httpOnly: true });
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });
  app.listen(4000, () => {
    console.log("server is ready at http://localhost:4000/graphql");
  });
})();
