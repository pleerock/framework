import {select} from "@framework/core";
import {app} from "@framework-sample/client-server-app-shared";

export const postsQuery = (descriptionShorten: number) => select(
  app.query("posts"),
  {
    select: {
      id: true,
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
    }
  }
)
