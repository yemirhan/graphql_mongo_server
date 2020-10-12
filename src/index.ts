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
(async () => {
  const app = express();
  await mongoose.connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app.use(
    cors({
      origin: "http://localhost:3000",
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

  app.listen(4000, () => {
    console.log("server is ready at http://localhost:4000/graphql");
  });
})();
