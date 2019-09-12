import {entity} from "@framework/server";
import { app } from "../app";

export const UserEntity = entity(
  app.model("UserModel"), 
  {
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
  }
)
