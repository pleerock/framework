import {app} from "../app"

app
  .query("posts")
  .resolve(() => {
    return app
      .repository("PostModel")
      .find()
  })
