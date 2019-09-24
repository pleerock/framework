import {app} from "@microframework-sample/client-server-app-shared";

app
  .model("PostModel")
  .resolve({
    likes(post, context) {
      // console.log("from likes:", context.currentUser)
      // console.log(post);
      return null
    },
    description(post, args) {
      if (args.shorten && post.description.length > args.shorten) {
        return post.description.substr(0, args.shorten) + "..."
      }
      return post.description
    }
  }, {
    name(posts) {
      return posts.map(post => {
        return post.name + "!"
      })
    }
  })
