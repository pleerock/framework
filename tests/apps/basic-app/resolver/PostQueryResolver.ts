import {getRepository} from "typeorm";
import {PostType} from "../type/PostType";
import {app} from "../app";

export const PostQueryResolver = app
  .query("post")
  .resolve(({ id }) => {
    return getRepository<PostType>("PostModel").findOneOrFail(id)
    // return { id: id!, name: "Post #" + id, description: "About post #" + id, likes: 0 }
  })

