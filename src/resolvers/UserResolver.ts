import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  Authorized,
} from "type-graphql";
import { User, UserModel } from "../entities/User";
import Argon2 from "argon2";
import { UsernamePasswordInput } from "./types/UserInput";
import { validateRegister } from "../utils/validateRegister";
import { createAccessToken } from "../utils/createRefreshToken";
import { ObjectId } from "mongodb";
import { ExpContext } from "../utils/expcontext";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";
import { redis } from "../redis";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field()
  userId: ObjectId;
}

/** @class Resolver for user queries and mutations */
@Resolver()
export class UserResolver {
  @Authorized()
  @Query(() => String)
  hello() {
    return "hi!";
  }

  /**
   * Gets all of the users that are signed up
   * @returns {Promise<Users[]>} All users
   */
  @Query(() => [User])
  async allUsers(): Promise<User[]> {
    return await UserModel.find({});
  }

  /**
   *Gets the user if userId is set on query header
   * @param {ExpContext} ctx Middleware for Express that has express.Request and express.Response objects in it
   *
   * @returns {Promise<User | null>} If header for userId is set, function returns User object
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: ExpContext): Promise<User | null> {
    if (!ctx.req.session!.userId) {
      return null;
    }

    return await UserModel.findOne({
      _id: ctx.req.session!.userId as ObjectId,
    });
  }

  /**
   * Registers the user
   * @param {UsernamePasswordInput} input Defined in ./types/UserInput.ts
   * @see {UsernamePasswordInput}
   *
   * @returns {Promise<Boolean>} If there is a validation error, function returns false, if successful, returns true
   */
  @Mutation(() => Boolean)
  async register(
    @Arg("userInput") input: UsernamePasswordInput
  ): Promise<Boolean> {
    const errors = validateRegister(input);
    if (errors) {
      throw new Error(`${errors}`);
    }
    const hashedPass = await Argon2.hash(input.password);
    const user = new UserModel({
      email: input.email,
      username: input.username,
      password: hashedPass,
    } as User);
    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error(`Username already taken!`);
      }
      console.log(err);
      return false;
    }
    const emailUser = await UserModel.findOne({ email: input.email });

    await sendEmail(input.email, await createConfirmationUrl(emailUser!._id));
    return true;
  }

  /**
   * Registers the user
   * @param {string} email Email of user
   * @param {string} password Password of user
   *
   * @returns {Promise<LoginResponse>} If user is validated, function returns accessToken and userId
   */
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: ExpContext
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error("User does not exists");
    }
    if (!user.confirmed) {
      throw new Error("User is not confirmed!");
    }
    const valid = await Argon2.verify(user.password, password);
    if (!valid) {
      throw new Error("wrong password!");
    }
    ctx.req.session!.userId = user._id;
    return {
      accessToken: createAccessToken(user),
      userId: user._id,
    };
  }
  /**
   * Registers the user
   * @param {string} token Token user got from the email
   *
   * @returns {Promise<Boolean>} If user is confirmed, returns true, else returns false
   */
  @Mutation(() => Boolean, { nullable: true })
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    const confirmToken = await redis.get(token);
    if (!confirmToken) {
      return false;
    }
    const user = await UserModel.findOne({ _id: confirmToken });
    if (user?.confirmed) {
      return false;
    }
    await UserModel.findOneAndUpdate(
      { _id: new ObjectId(confirmToken) },
      { confirmed: true }
    );
    await redis.del(confirmToken);
    return true;
  }
  @Mutation(() => Boolean, { nullable: true })
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("User Not Found");
    }
    await sendEmail(email, await createConfirmationUrl(user._id));
    return true;
  }

  @Mutation(() => Boolean, { nullable: true })
  async changePassword(@Arg("email") email: string) {
    const user = await UserModel.findOne({ email });
    return user;
  }
}
