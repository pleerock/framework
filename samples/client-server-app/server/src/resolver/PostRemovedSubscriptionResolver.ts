import {app} from "@microframework-sample/client-server-app-shared";

export const PostRemovedSubscriptionResolver = app
  .subscription("postRemoved")
  .resolve({
    triggers: ["POST_REMOVED"]
  })
