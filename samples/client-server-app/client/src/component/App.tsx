import React, {useEffect} from "react"
import {postsQuery} from "@framework-sample/client-server-app-query";
import { app } from "@framework-sample/client-server-app-shared";

export const App = () => {

  const loadPosts = async () => {
    postsQuery(4)
      .fetch()
      .then(posts => {
        console.log(posts)
        console.log(posts.map(post => post.id))
        // posts.forEach(post => console.log(post))
      })
  }

  app.model("PostModel").one({
    select: {
      likes: true
    },
    args: {
      where: {
        id: 1
      }
    }
  }
  ).then(post => {
    console.log(post.likes)
  })

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>Hello App</div>
  )
}
