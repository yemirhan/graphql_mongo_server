import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User, UserModel } from "../entities/User";
import Argon2 from "argon2";
import { UsernamePasswordInput } from "./types/UserInput";
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
    const hashedPass = await Argon2.hash(input.password);
    try {
      const user = new UserModel({
        email: input.email,
        username: input.username,
        password: hashedPass,
      } as User);
      await user.save();
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
}
