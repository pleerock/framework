import {app} from "../app"

app
  .action("/users")
  .resolve(() => {
    return app
      .repository("UserModel")
      .find()
  })
