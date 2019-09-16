import {getConnection} from "typeorm";
import {app, PostType} from "@framework-sample/client-server-app-shared";
import {resolve} from "@framework/core";

export const PostsQueryResolver = resolve(
  app.query("posts"),
  () => {
    return app
      .repository("PostModel")
      .find()
  }
)
