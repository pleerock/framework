import {app} from "@microframework-sample/client-server-app-shared";
import {PostRepository} from "../repository";

export const PostsQueryResolver = app
  .query("posts")
  .resolve(({ limit }) => {
    return PostRepository.findAllPosts(limit)
  })
