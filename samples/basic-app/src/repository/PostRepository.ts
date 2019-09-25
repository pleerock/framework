import * as typeorm from "typeorm"
import {app} from "../app";

export const PostRepository = app.repository("PostModel", repository => ({
  getAllPosts() {
    return repository.find()
  }
}))
