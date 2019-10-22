import * as typeorm from "typeorm"
import {app} from "@microframework-sample/client-server-app-shared";

export const PostRepository = app.model("PostModel").repository(repository => ({
  findAllPosts(limit: number) {
    return repository.find({ take: limit })
  }
}))
