import {app} from "@framework-sample/client-server-app-shared";
import {getRepository} from "typeorm";
import {PostType} from "@framework-sample/client-server-app-shared";

export const PostSaveMutationResolver = app
  .mutation("savePost")
  .resolve(({ post }, { connection }) => {
    if (!post) throw new Error(`I need a post`)
    return connection.getRepository<PostType>("PostModel").save({
      name: post.name,
      description: post.description,
      likes: post.likes,
      author: {
        id: post.authorId
      }
    })
  })
