import { InputType, Field, ID } from "type-graphql";
import { ObjectId } from "mongodb";
@InputType()
export class UsernamePasswordInput {
  @Field(() => String)
  email: string;
  @Field(() => String)
  username: string;
  @Field(() => String)
  password: string;
}
@InputType()
export class UserIdInput {
  @Field(() => ID)
  _id: ObjectId;
}
