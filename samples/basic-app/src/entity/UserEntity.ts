import {entity} from "@framework/server";
import {UserModel} from "../model/UserModel";

export const UserEntity = entity(UserModel, {
  model: {
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
  }
})
