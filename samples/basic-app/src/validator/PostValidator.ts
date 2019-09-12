import {validator} from "@framework/core";
import {PostModel} from "../model/PostModel";
import {app} from "../app";

export const PostValidator = validator(
  app.model("PostModel"),
  {
    name: {
      minLength: 10,
      maxLength: 100
    },
    description: {
      minLength: 100,
      maxLength: 10000
    }
  }
)
