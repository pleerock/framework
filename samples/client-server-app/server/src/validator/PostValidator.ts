import {validator} from "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const PostValidator = validator(
  app.model("PostModel"),
  {
    name: {
      minLength: 3,
      maxLength: 100
    },
    description: {
      minLength: 2,
      maxLength: 10000
    }
  }
)
