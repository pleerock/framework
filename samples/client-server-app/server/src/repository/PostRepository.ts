import * as typeorm from "typeorm"
import {app} from "@microframework-sample/client-server-app-shared";

export const PostRepository = app.repository("PostModel", repository => ({
  findAllPosts(limit: number) {
    return repository.find({ take: limit })
  }
}))
