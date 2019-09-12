import {getRepository} from "typeorm";
import {PostType} from "../type/PostType";
import {app} from "../app";

export const PostsQueryResolver = app
  .query("posts")
  .resolve(() => {
    return getRepository<PostType>("PostModel").find()
    // return [
    //   { id: 1, name: "Post #1", description: "About post #1", likes: 0 },
    //   { id: 2, name: "Post #2", description: "About post #2", likes: 5 },
    //   { id: 3, name: "Post #3", description: "About post #3", likes: 10 },
    // ]
  })
