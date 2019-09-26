import "@microframework/core";
import {PostType} from "..";
import { app } from "../app";

export const postSaveQuery = (post: Partial<PostType>) => app
  .model("PostModel")
  .save(post, {
    select: {
      id: true,
      name: true,
      likes: true
    },
  })

