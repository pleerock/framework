import {app, PostType} from "@framework-sample/client-server-app-shared";
import {getConnection} from "typeorm";
import {resolve} from "@framework/core";

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
