import * as typeorm from "typeorm"
import {app} from "../app";

export const PostRepository = app
  .model("PostModel")
  .repository(repository => ({
    getAllPosts() {
      return repository.find()
    }
  }))
