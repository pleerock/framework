import React, {useEffect} from "react"
import {postsQuery, postModelQuery} from "@microframework-sample/client-server-app-query";

export const App = () => {

  const loadPosts = async () => {
    postsQuery(4)
      .fetch()
      .then(posts => {
        console.log(posts)
        console.log(posts.map(post => post.likes))
        // posts.forEach(post => console.log(post))
      })

    postModelQuery(1)
      .fetch()
      .then(post => {
        console.log(post)
      })
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>Hello App</div>
  )
}
