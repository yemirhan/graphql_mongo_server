import { prop as Property, getModelForClass, Ref } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import * as mongoose from "mongoose";

@ObjectType()
export class Post {
  @Field()
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  title: string;

  @Field({ nullable: true })
  @Property()
  description?: string;

  @Field(() => User)
  @Property({ ref: () => User, required: true })
  author: Ref<User>;
}

export const PostModel = getModelForClass(Post, {
  existingMongoose: mongoose,
  schemaOptions: { collection: "posts" },
});
