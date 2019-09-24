import {args, inputArray, model, nullable} from "@microframework/core";
import {UserModel} from "./UserModel";

export const PostModel = model("PostModel", {
  id: args(Number, {
    ids: nullable(inputArray({
      name: String
    }))
  }),
  name: String,
  description: args(String, {
    shorten: nullable(Number)
  }),
  likes: nullable(Number),
  author: UserModel
})
