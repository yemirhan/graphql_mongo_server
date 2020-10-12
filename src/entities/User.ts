import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  readonly _id: ObjectId;

  @Field(() => String)
  @Property({ required: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Property()
  username: string;

  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
