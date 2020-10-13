import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
} from "type-graphql";
import { User, UserModel } from "../entities/User";
import Argon2 from "argon2";
import { UsernamePasswordInput } from "./types/UserInput";
import { validateRegister } from "../utils/validateRegister";
import { createAccessToken } from "../auth/createRefreshToken";
import { ObjectId } from "mongodb";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field()
  userid: ObjectId;
}
@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }
  @Query(() => [User])
  async Users(): Promise<User[]> {
    return await UserModel.find({});
  }
  @Mutation(() => Boolean)
  async register(@Arg("userInput") input: UsernamePasswordInput) {
    const errors = validateRegister(input);
    if (errors) {
      return { errors };
    }
    const hashedPass = await Argon2.hash(input.password);
    try {
      const user = new UserModel({
        email: input.email,
        username: input.username,
        password: hashedPass,
      } as User);
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new Error(`Username already taken!`);
      }
      console.log(err);
      return false;
    }
    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email });
    console.log(user);

    if (!user) {
      throw new Error("User does not exists");
    }
    const valid = await Argon2.verify(user.password, password);
    if (!valid) {
      throw new Error("wrong password!");
    }

    return {
      accessToken: createAccessToken(user),
      userid: user._id,
    };
  }
}
