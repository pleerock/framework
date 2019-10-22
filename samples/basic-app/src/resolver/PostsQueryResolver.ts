import {app} from "../app"
import {PostRepository} from "../repository";

const PostsQueryResolver = app
  .query("posts")
  .resolve(() => {
    return PostRepository.find()
  })
