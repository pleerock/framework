import {app} from "@framework-sample/client-server-app-shared";

app
  .query("posts")
  .resolve(() => {
    return app
      .repository("PostModel")
      .find()
  })
