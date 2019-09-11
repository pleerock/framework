import {input} from "../../../../src/app";

export const PostSaveInput = input("PostSaveInput", {
  id: Number,
  name: String,
  description: String,
  likes: Number,
  authorId: Number,
})
