import {app} from "../app"
import {getConnection} from "typeorm"
import {PostType} from "../type/PostType"
import {resolve} from "@framework/core"

export const PostSaveMutationResolver = resolve(
  app.mutation("savePost"),
  ({ post }) => {
    if (!post) throw new Error(`I need a post`)
    return getConnection()
      .getRepository<PostType>("PostModel")
      .save({
        name: post.name,
        description: post.description,
        likes: post.likes,
        author: {
          id: post.authorId
        }
      })
  }
)
