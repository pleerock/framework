import "@microframework/core";
import {app} from "@microframework-sample/client-server-app-shared";

export const postsQuery = (descriptionShorten: number) => app
  .query("posts")
  .select({
    select: {
      id: {
        args: {
          ids: []
        }
      },
      likes: true,
      description: {
        args: {
          shorten: descriptionShorten
        }
      },
      author: {
        select: {
          id: true,
          firstName: true,
          fullName: {
            args: {
              includeId: true
            }
          }
        }
      }
    },
    args: {
      offset: 0,
      limit: 10,
    }
  })
