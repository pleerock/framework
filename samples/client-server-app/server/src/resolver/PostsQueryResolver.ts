import {getRepository} from "typeorm";
import {PostType} from "@framework-sample/client-server-app-shared";
import {app} from "@framework-sample/client-server-app-shared";

export const PostsQueryResolver = app
  .query("posts")
  .resolve(({ connection }) => {
    return connection.getRepository<PostType>("PostModel").find()
    // return [
    //   { id: 1, name: "Post #1", description: "About post #1", likes: 0 },
    //   { id: 2, name: "Post #2", description: "About post #2", likes: 5 },
    //   { id: 3, name: "Post #3", description: "About post #3", likes: 10 },
    // ]
  })
