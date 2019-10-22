import * as typeorm from "typeorm"
import {app} from "../app";

export const UserRepository = app
  .model("UserModel")
  .repository(repository => ({
    getAllPosts() {
      return repository.find()
    }
  }))
