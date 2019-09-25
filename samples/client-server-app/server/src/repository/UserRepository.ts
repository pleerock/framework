import * as typeorm from "typeorm"
import {app} from "@microframework-sample/client-server-app-shared";

export const UserRepository = app.repository("UserModel", repository => ({
  getAllPosts() {
    return repository.find()
  }
}))
