import {args, model, nullableInput} from "@microframework/core";
import {optional} from "@microframework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: Number,
  name: String,
  description: args(String, {
    shorten: nullableInput(Number)
  }),
  likes: optional(Number),
  author: UserModel
})
