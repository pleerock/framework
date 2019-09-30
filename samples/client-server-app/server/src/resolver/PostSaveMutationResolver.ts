import {app} from "@microframework-sample/client-server-app-shared";
import {PubSubImpl} from "../index";

app
  .mutation("savePost")
  .resolve(async postInput => {

    const post = await app
      .repository("PostModel")
      .save({
        name: postInput.name,
        description: postInput.description,
        likes: postInput.likes,
        author: {
          id: postInput.authorId
        }
      })

    console.log("publishing: ", post)
    await PubSubImpl.publish("POST_ADDED", post)

    return post
  })
