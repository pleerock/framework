import {app} from "@framework-sample/client-server-app-shared";

app
  .mutation("savePost")
  .resolve(({ post }) => {
    if (!post) throw new Error(`I need a post`)
    return app
      .repository("PostModel")
      .save({
        name: post.name,
        description: post.description,
        likes: post.likes,
        author: {
          id: post.authorId
        }
      })
  })
