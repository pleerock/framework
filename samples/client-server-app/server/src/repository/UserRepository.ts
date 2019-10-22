import * as typeorm from "typeorm"
import {app} from "@microframework-sample/client-server-app-shared";

export const UserRepository = app.model("UserModel").repository(repository => ({
  getAllPosts() {
    return repository.find()
  }
}))
