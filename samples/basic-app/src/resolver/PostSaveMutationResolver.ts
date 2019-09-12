import {app} from "../app";
import {getRepository} from "typeorm";
import {PostType} from "../type/PostType";

export const PostSaveMutationResolver = app
  .mutation("savePost")
  .resolve(({ post }) => {
    if (!post) throw new Error(`I need a post`)
    return getRepository<PostType>("PostModel").save({
      name: post.name,
      description: post.description,
      likes: post.likes,
      author: {
        id: post.authorId
      }
    })
  })
