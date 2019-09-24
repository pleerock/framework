import {args, model} from "@microframework/core";
import {nullable} from "@microframework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: Number,
  name: String,
  description: args(String, {
    shorten: nullable(Number)
  }),
  likes: nullable(Number),
  author: UserModel
})
