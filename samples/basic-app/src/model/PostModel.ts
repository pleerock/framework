import {args, model, nullableInput} from "@microframework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: Number,
  name: String,
  description: args(String, {
    shorten: nullableInput(Number)
  }),
  likes: Number,
  author: UserModel
})
