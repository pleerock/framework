import {app} from "@microframework-sample/client-server-app-shared";

export const PostAddedSubscriptionResolver = app
  .subscription("postAdded")
  .resolve({
    triggers: ["POST_ADDED"]
  })
