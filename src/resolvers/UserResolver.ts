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
import { createAccessToken } from "../createRefreshToken";
import { ObjectId } from "mongodb";
import { ExpContext } from "src/expcontext";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field()
  userid: ObjectId;
}
@Resolver()
export class UserResolver {
  @Authorized()
  @Query(() => String)
  hello() {
    return "hi!";
  }
  @Query(() => [User])
  async allUsers(): Promise<User[]> {
    return await UserModel.find({});
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: ExpContext): Promise<User | null> {
    if (!ctx.req.session!.userId) {
      return null;
    }

    return await UserModel.findOne({
      _id: ctx.req.session!.userId as ObjectId,
    });
  }

  @Mutation(() => Boolean)
  async register(@Arg("userInput") input: UsernamePasswordInput) {
    const errors = validateRegister(input);
    if (errors) {
      return { errors };
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

    await sendEmail(input.email, createConfirmationUrl(emailUser!._id));
    return true;
  }

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
    const valid = await Argon2.verify(user.password, password);
    if (!valid) {
      throw new Error("wrong password!");
    }
    ctx.req.session!.userId = user._id;
    return {
      accessToken: createAccessToken(user),
      userid: user._id,
    };
  }
}
