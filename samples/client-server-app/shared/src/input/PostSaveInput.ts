import {input, nullable} from "@microframework/core";

export const PostSaveInput = input("PostSaveInput", {
  id: nullable(Number),
  name: String,
  description: String,
  likes: Number,
  authorId: Number,
})
