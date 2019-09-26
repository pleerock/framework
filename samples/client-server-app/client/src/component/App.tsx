import {postSaveQuery, postsCountQuery, postsQuery, PostsQueryType} from "@microframework-sample/client-server-app-shared";
import {postRemoveQuery} from "@microframework-sample/client-server-app-shared";
import React, {useEffect, useState} from "react"

export const App = () => {

  const [postsCount, setPostsCount] = useState(0)
  const [editablePost, setEditablePost] = useState({
    name: "",
    description: "",
    likes: 0,
    authorId: 0,
  })

  const [posts, setPosts] = useState<PostsQueryType>([])

  const loadPosts = async () => {
    postsQuery(4)
      .fetch()
      .then(posts => setPosts(posts))

    postsCountQuery({ name: "a" })
      .fetch()
      .then(count => setPostsCount(count))
  }

  const savePost = async () => {
    postSaveQuery(editablePost)
      .fetch()
      .then(post => {
        console.log("post has been saved", post)

        loadPosts()
      })
  }

  const removePost = async (post: PostsQueryType[0]) => {
    postRemoveQuery(post.id)
      .fetch()
      .then(() => {
        console.log("post has been removed")

        loadPosts()
      })
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>
      <div>Hello App (count: { postsCount })</div>
      <ul>
        { posts.map(post => (
          <li key={post.id}>{ post.id }) { post.name } <button onClick={() => removePost(post)}>delete</button></li>
        )) }
      </ul>

      <hr />
      <form>
        Name: <input onChange={event => (setEditablePost({ ...editablePost, name: event.target.value }))} value={editablePost.name} /><br/>
        Description: <input onChange={event => (setEditablePost({ ...editablePost, description: event.target.value }))} value={editablePost.description} /><br/>
        Likes: <input onChange={event => (setEditablePost({ ...editablePost, likes: parseInt(event.target.value) }))} value={editablePost.likes} /><br/>
        Author ID: <input onChange={event => (setEditablePost({ ...editablePost, authorId: parseInt(event.target.value) }))} value={editablePost.authorId} /><br/>
        <button type="button" onClick={() => savePost()}>save</button>
      </form>
    </div>
  )
}
