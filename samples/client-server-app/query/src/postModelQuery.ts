import {selectOne} from "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const postModelQuery = (id: number) => selectOne(
  app.model("PostModel"),
  {
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
  }
)
