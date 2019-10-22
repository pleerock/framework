import {app} from "../app"
import {UserRepository} from "../repository";

const UsersActionResolver = app
  .action("/users")
  .resolve(() => {
    return UserRepository.find()
  })
