import "@microframework/core";
import {app} from "../app";

export const checkPostsQuery = () => app
  .query("checkPosts")
  .select({
    select: {
      status: true
    }
  })
  .fetch()

