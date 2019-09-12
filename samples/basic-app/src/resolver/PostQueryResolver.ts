import {getConnection} from "typeorm"
import {PostType} from "../type/PostType"
import {app} from "../app"
import {resolve} from "@framework/core"

export const PostQueryResolver = resolve(
  app.query("post"),
  ({ id }) => {
    return getConnection()
      .getRepository<PostType>("PostModel")
      .findOneOrFail(id)
  }
)

