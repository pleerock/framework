import "@microframework/core";
import {app} from "../";

export const postsQuery = (descriptionShorten: number) => app
  .query("posts")
  .select({
    select: {
      id: true,
      name: true,
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
      limit: 1000,
    }
  })
