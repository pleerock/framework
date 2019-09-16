import {app} from "@framework-sample/client-server-app-shared";
import {resolve} from "@framework/core";

export const PostQueryResolver = resolve(
  app.query("post"),
  async ({ id }) => {
    return app.repository("PostModel").findOneOrFail(id)
  }
)
