import { UsernamePasswordInput } from "../resolvers/types/UserInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.username.length <= 4) {
    return [
      {
        field: "username",
        message: "length must be greater than 4",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include an @",
      },
    ];
  }

  if (options.password.length < 8) {
    return [
      {
        field: "password",
        message: "length must be at least 8",
      },
    ];
  }

  return null;
};
