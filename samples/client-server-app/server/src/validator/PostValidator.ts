import {app} from "@microframework-sample/client-server-app-shared";

export const PostValidator = app
  .model("PostModel")
  .validator({
    name(value, parent, context) {
      // if (parent.authorId !== context.currentUser.id)
      //   throw new Error("No, no, you can't see this one")
      return value
    },
    description: {
      minLength: 2,
      maxLength: 10000
    }
  })
  .validate((post, context) => {
    // if (post.authorId !== context.currentUser.id)
    //   throw new Error("No, no, you can't access this one")
  })
