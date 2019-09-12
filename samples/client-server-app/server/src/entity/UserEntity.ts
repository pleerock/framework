import {entity} from "@framework/server";
import {UserModel, app} from "@framework-sample/client-server-app-shared";

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
