import {getConnection} from "typeorm"
import {resolve} from "@framework/core"
import {PostType} from "../type/PostType"
import {app} from "../app"

export const PostsQueryResolver = resolve(
  app.query("posts"),
  () => {
    return getConnection()
      .getRepository<PostType>("PostModel")
      .find()
  }
)
