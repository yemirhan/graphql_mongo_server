import { ObjectId } from "mongodb";
import {
  Resolver,
  Query,
  FieldResolver,
  Arg,
  Root,
  Mutation,
  UseMiddleware,
  // Mutation,
} from "type-graphql";

import { Post, PostModel } from "../entities/Post";
import { User, UserModel } from "../entities/user";
import { PostInput } from "./types/PostInput";
import { ObjectIdScalar } from "../object-id.scalar";
import { UserIdInput } from "./types/UserInput";
import { isAuth } from "../middlewares/isAuth";

// interface Context {
//   user: User;
// }

@Resolver(() => Post)
export class PostResolver {
  @Query(() => Post, { nullable: true })
  post(@Arg("postId", () => ObjectIdScalar) postId: ObjectId) {
    return PostModel.findById(postId);
  }

  @Query(() => [Post])
  async posts(): Promise<Array<Post>> {
    return await PostModel.find({});
  }
  @UseMiddleware(isAuth)
  @Mutation(() => Post)
  async addPost(
    @Arg("recipe") postInput: PostInput,
    @Arg("user") user: UserIdInput
  ): Promise<Post> {
    const founduser = await UserModel.findById({ _id: user._id });

    const post = new PostModel({
      title: postInput.title,
      description: postInput.description,
      author: { ...founduser },
    } as Post);
    await post.save();
    return post;
  }

  @FieldResolver()
  async author(@Root() recipe: Post): Promise<User> {
    return (await UserModel.findById(recipe.author))!;
  }
}
