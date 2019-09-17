import {app} from "../app"

app
  .query("post")
  .resolve(({ id }) => {
    return app
      .repository("PostModel")
      .findOneOrFail(id)
  })

