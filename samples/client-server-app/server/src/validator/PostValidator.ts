import {validator} from "@framework/core";
import {PostModel} from "@framework-sample/client-server-app-shared";

export const PostValidator = validator(PostModel, {
  name: {
    minLength: 10,
    maxLength: 100
  },
  description: {
    minLength: 100,
    maxLength: 10000
  }
})
