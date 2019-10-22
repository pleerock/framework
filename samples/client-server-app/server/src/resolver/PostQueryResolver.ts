import {app} from "@microframework-sample/client-server-app-shared";
import {PostRepository} from "../repository";

export const PostQueryResolver = app
  .query("post")
  .resolve(({ id }) => {
    return PostRepository.findOneOrFail(id)
  })
