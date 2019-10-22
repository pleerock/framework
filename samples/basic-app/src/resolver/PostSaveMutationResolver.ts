import {app} from "../app"
import {PostRepository} from "../repository";

const PostSaveMutationResolver = app
  .mutation("savePost")
  .resolve(({ post }) => {
    if (!post) throw new Error(`I need a post`)
    return PostRepository.save({
        name: post.name,
        description: post.description,
        likes: post.likes,
        author: {
          id: post.authorId
        }
      })
  })
