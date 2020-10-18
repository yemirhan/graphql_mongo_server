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
import { ObjectIdScalar } from "../utils/object-id.scalar";
import { ExpContext } from "../utils/expcontext";
import { TypegooseMiddleware } from "../middlewares/typegoose-middleware";

/** @class Resolver for Posts */
@Resolver(() => Post)
export class PostResolver implements ResolverInterface<Post> {
  /**
   * Gets a spesific post
   * @param {ObjectId} postId Id of post
   *
   * @returns {Promise<Post | null>} Returns post with id postId, if not found returns null
   */
  @Query(() => Post, { nullable: true })
  @UseMiddleware(TypegooseMiddleware)
  async post(
    @Arg("postId", () => ObjectIdScalar) postId: ObjectId
  ): Promise<Post | null> {
    return await PostModel.findById({ _id: postId });
  }

  /**
   * Gets all posts
   * @returns {Promise<Post[]>} Returns all posts
   */
  @Query(() => [Post])
  @UseMiddleware(TypegooseMiddleware)
  async posts(): Promise<Post[]> {
    return await PostModel.find({});
  }

  /**
   * Registers the user
   * @param {PostInput} postInput Declared in ./types/PostInput.ts
   *
   * @returns {Promise<Post>} Returns created post
   */
  @Authorized()
  @UseMiddleware(TypegooseMiddleware)
  @Mutation(() => Post)
  async addPost(
    @Arg("post") postInput: PostInput,
    @Ctx() ctx: ExpContext
  ): Promise<Post> {
    const post = await PostModel.create({
      title: postInput.title,
      description: postInput.description,
      author: new ObjectId(ctx.req.session!.userId),
    });
    await post.save();
    return post;
  }

  @FieldResolver()
  async author(@Root() recipe: Post): Promise<User> {
    return (await UserModel.findById(recipe.author))!;
  }
}
