import "@microframework/core";
import { app } from "../app";

export const postModelQuery = (id: number) => app
  .model("PostModel")
  .one({
    select: {
      // id: true,
      name: true,
      likes: true
    },
    args: {
      where: {
        id: id
      }
    }
  })

