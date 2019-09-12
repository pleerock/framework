import {getRepository} from "typeorm";
import {PostType} from "@framework-sample/client-server-app-shared";
import {app} from "@framework-sample/client-server-app-shared";

export const PostQueryResolver = app
  .query("post")
  .resolve(({ id }, { connection }) => {
    return connection.getRepository<PostType>("PostModel").findOneOrFail(id)
    // return { id: id!, name: "Post #" + id, description: "About post #" + id, likes: 0 }
  })

