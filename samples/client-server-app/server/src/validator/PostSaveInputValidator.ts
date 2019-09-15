import {validator} from "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const PostSaveInputValidator = validator(
  app.input("PostSaveInput"),
  {
    name: {
      minLength: 1
    },
    description: {
      minLength: 5
    },
  }
)
