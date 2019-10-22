import { app } from "../app";

export const UserEntity = app
  .model("UserModel")
  .entity()
  .schema({
    id: {
      type: "int",
      primary: true,
      generated: "increment"
    },
    firstName: {
      type: "varchar"
    },
    lastName: {
      type: "varchar"
    },
  })
