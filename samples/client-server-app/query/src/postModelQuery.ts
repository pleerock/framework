import "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const postModelQuery = (id: number) => app
  .model("PostModel")
  .one({
    select: {
      id: true,
      name: true,
      likes: true
    },
    args: {
      where: {
        id: id
      }
    }
  })

