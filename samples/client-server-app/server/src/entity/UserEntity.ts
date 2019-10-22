import "@microframework/core";
import {app} from "@microframework-sample/client-server-app-shared";

export const UserEntity = app
  .model("UserModel")
  .entity()
  .resolvable(true)
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
