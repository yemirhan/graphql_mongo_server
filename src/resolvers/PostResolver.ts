import { ObjectId } from "mongodb";
import {
  Resolver,
  Query,
  FieldResolver,
  Arg,
  Root,
  Mutation,
  UseMiddleware,
  Ctx,
  // Mutation,
} from "type-graphql";

import { Post, PostModel } from "../entities/Post";
import { User, UserModel } from "../entities/User";
import { PostInput } from "./types/PostInput";
import { ObjectIdScalar } from "../object-id.scalar";
import { isAuth } from "../middlewares/isAuth";
import { ExpContext } from "src/expcontext";

// interface Context {
//   user: User;
// }

@Resolver(() => Post)
export class PostResolver {
  @Query(() => Post, { nullable: true })
  async post(@Arg("postId", () => ObjectIdScalar) postId: ObjectId) {
    return await PostModel.findById({ _id: postId });
  }

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await PostModel.find({});
  }
  @UseMiddleware(isAuth)
  @Mutation(() => Post)
  async addPost(@Arg("recipe") postInput: PostInput, @Ctx() ctx: ExpContext) {
    console.log(ctx.req.session!.userId);

    // const founduser = await UserModel.findById({
    //   _id: new ObjectId(ctx.req.session!.userId),
    // });

    const post = new PostModel({
      title: postInput.title,
      description: postInput.description,
      author: new ObjectId(ctx.req.session!.userId),
    });
    await post.save();
    console.log(post);

    return {
      id: post._id,
      title: post.title,
      description: post.description,
      author: post.author,
    };
  }

  @FieldResolver()
  async author(@Root() recipe: Post): Promise<User> {
    return (await UserModel.findById(recipe.author))!;
  }
}
