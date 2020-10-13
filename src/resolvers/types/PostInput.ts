import { InputType, Field } from "type-graphql";

import { Post } from "../../entities/Post";

@InputType()
export class PostInput implements Partial<Post> {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;
}
