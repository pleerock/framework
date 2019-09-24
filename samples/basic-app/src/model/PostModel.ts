import {args, model, optional} from "@microframework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: Number,
  name: String,
  description: args(String, {
    shorten: optional(Number)
  }),
  likes: Number,
  author: UserModel
})
