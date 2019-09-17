import {app} from "../app"

app
  .model("PostModel")
  .resolve({
    likes(post, context) {
      // console.log("from likes:", context.currentUser)
      // console.log(post);
      return 100
    },
    description(post, args) {
      if (args.shorten && post.description.length > args.shorten) {
        return post.description.substr(0, args.shorten) + "..."
      }
      return post.description
    }
  })
