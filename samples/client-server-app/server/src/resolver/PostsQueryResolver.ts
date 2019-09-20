import {app} from "@microframework-sample/client-server-app-shared";

app
  .query("posts")
  .resolve(({ limit }) => {
    return app
      .repository("PostModel")
      .find({ take: limit })
  })
