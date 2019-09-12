import {validator} from "@framework/core";
import {PostModel} from "../model/PostModel";

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
