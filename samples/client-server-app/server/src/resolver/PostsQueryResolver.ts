import {app} from "@microframework-sample/client-server-app-shared";
import {PostRepository} from "../repository";

app
  .query("posts")
  .resolve(({ limit }) => {
    return PostRepository.findAllPosts(limit)
  })
