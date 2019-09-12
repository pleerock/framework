import {PostType} from "@framework-sample/client-server-app-shared";
import {app} from "@framework-sample/client-server-app-shared";
import {resolve} from "@framework/core";
import {getConnection} from "typeorm";

export const PostQueryResolver = resolve(
  app.query("post"),
  ({ id }) => {
    return getConnection()
      .getRepository<PostType>("PostModel")
      .findOneOrFail(id)
  }
)
