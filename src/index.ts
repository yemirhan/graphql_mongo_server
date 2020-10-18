import "dotenv/config";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import * as path from "path";
import { ObjectId } from "mongodb";
import { ObjectIdScalar } from "./utils/object-id.scalar";
import mongoose from "mongoose";
import { PostResolver } from "./resolvers/PostResolver";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectRedis from "connect-redis";
import { redis } from "./redis";
import { UserResolver } from "./resolvers/UserResolver";

(async () => {
  const app = express();
  app.use(cookieParser());
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );
  const RedisStore = connectRedis(session);
  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: "qid",
      secret: process.env.REDIS_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV! === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    })
  );
  await mongoose.connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
      emitSchemaFile: path.resolve(__dirname, "schema.gql"),
      authChecker: ({ context: { req } }) => {
        return !!req.session.userId;
      },
      validate: false,
    }),
    context: ({ req }: any) => ({ req }),
  });
  apolloServer.applyMiddleware({ app, cors: false });
  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello");
  });
  app.listen(4000, () => {
    console.log("server is ready at http://localhost:4000/graphql");
  });
})();
