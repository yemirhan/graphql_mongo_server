import { ObjectId } from "mongodb";
import {
  Resolver,
  Query,
  FieldResolver,
  Arg,
  Root,
  Mutation,
  Ctx,
  Authorized,
  ResolverInterface,
  UseMiddleware,
} from "type-graphql";

import { Post, PostModel } from "../entities/Post";
import { User, UserModel } from "../entities/User";
import { PostInput } from "./types/PostInput";
import { ObjectIdScalar } from "../object-id.scalar";

import { ExpContext } from "../expcontext";
import { TypegooseMiddleware } from "../middlewares/typegoose-middleware";

// interface Context {
//   user: User;
// }

@Resolver(() => Post)
export class PostResolver implements ResolverInterface<Post> {
  @Query(() => Post, { nullable: true })
  @UseMiddleware(TypegooseMiddleware)
  async post(@Arg("postId", () => ObjectIdScalar) postId: ObjectId) {
    const findpost = await PostModel.findById({ _id: postId });
    console.log(typeof findpost?.author);
    return await PostModel.findById({ _id: postId });
  }

  @Query(() => [Post])
  @UseMiddleware(TypegooseMiddleware)
  async posts(): Promise<Post[]> {
    return await PostModel.find({});
  }
  @Authorized()
  @UseMiddleware(TypegooseMiddleware)
  @Mutation(() => Post)
  async addPost(@Arg("recipe") postInput: PostInput, @Ctx() ctx: ExpContext) {
    console.log(ctx.req.session!.userId);
    console.log(typeof ctx.req.session!.userId);

    // const founduser = await UserModel.findById({
    //   _id: new ObjectId(ctx.req.session!.userId),
    // });

    const post = await PostModel.create({
      title: postInput.title,
      description: postInput.description,
      author: new ObjectId(ctx.req.session!.userId),
    });
    await post.save();
    console.log(post.author);

    return post;
  }

  @FieldResolver()
  async author(@Root() recipe: Post): Promise<User> {
    return (await UserModel.findById(recipe.author))!;
  }
}
