import {app} from "@microframework-sample/client-server-app-shared";

app
  .subscription("postAdded")
  .resolve({
    triggers: ["POST_ADDED"]
  })
