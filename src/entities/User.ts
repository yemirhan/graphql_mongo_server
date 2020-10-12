import { prop as Property, getModelForClass } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  email: string;

  @Field({ nullable: true })
  @Property()
  username?: string;

  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
