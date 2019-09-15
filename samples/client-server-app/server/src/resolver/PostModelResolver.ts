import {resolve} from "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const PostModelResolver = resolve(
  app.model("PostModel"),
  {
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
    // name: withMany(posts => {
    //   return posts.map(post => {
    //     return post.name + "!"
    //   })
    // })
  }, {
    name(posts) {
      return posts.map(post => {
        return post.name + "!"
      })
    }
  }
)
