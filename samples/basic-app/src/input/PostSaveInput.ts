import {input} from "@microframework/core";

export const PostSaveInput = input("PostSaveInput", {
  id: Number,
  name: String,
  description: String,
  likes: Number,
  authorId: Number,
})
