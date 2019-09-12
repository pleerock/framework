import React, {useEffect} from "react"
import {postsQuery} from "@framework-sample/client-server-app-query";

export const App = () => {

  const loadPosts = async () => {
    postsQuery(4)
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
