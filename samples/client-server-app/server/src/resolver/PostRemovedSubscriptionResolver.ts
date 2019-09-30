import {app} from "@microframework-sample/client-server-app-shared";

app
  .subscription("postRemoved")
  .resolve({
    triggers: ["POST_REMOVED"]
  })
