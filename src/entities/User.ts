import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";
import * as mongoose from "mongoose";
@ObjectType()
export class User {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field(() => String)
  @Property({ required: true, unique: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Property({ required: true, unique: true })
  username: string;

  @Property({ required: true })
  password: string;

  @Property()
  tokenVersion: number;

  @Property({ default: false })
  confirmed: boolean;
}

export const UserModel = getModelForClass(User, {
  existingMongoose: mongoose,
  schemaOptions: { collection: "users" },
});
