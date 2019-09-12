import React, {useEffect} from "react"
import {app} from "@framework-sample/client-server-app-shared";

export const App = () => {

  const loadPosts = async () => {
    app.query("posts")
      .select({
        select: {
          id: true,
          likes: true,
          description: {
            args: {
              shorten: 4 
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
      })
      .fetch()
      .then(({ data }) => {
        console.log(data)
        console.log(data.map(post => post.id))
        // posts.forEach(post => console.log(post))
      })
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>Hello App</div>
  )
}
