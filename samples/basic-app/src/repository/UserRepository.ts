import * as typeorm from "typeorm"
import {app} from "../app";

export const UserRepository = app.repository("UserModel", repository => ({
  getAllPosts() {
    return repository.find()
  }
}))
