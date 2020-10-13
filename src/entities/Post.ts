import { prop as Property, getModelForClass, Ref } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

import { User } from "./user";

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

  @Field(() => ID)
  @Property({ ref: User, required: true })
  author: Ref<User>;
}

export const PostModel = getModelForClass(Post);
