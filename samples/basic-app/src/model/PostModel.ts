import {args, model} from "@framework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: Number,
  name: String,
  description: args(String, {
    shorten: Number
  }),
  likes: Number,
  author: UserModel
})
