import {app} from "../app";

export const PostValidator = app
  .model("PostModel")
  .validator({
    name(value, post, context) {

      // only current post's author can change post name
      if (context.currentUser.id === post.author.id) {
        return value
      }

      return undefined
    },
    description: {
      minLength: 100,
      maxLength: 10000
    }
  })
