import {app} from "@framework-sample/client-server-app-shared";

app
  .query("post")
  .resolve(({ id }) => {
    return app
      .repository("PostModel")
      .findOneOrFail(id)
  })
