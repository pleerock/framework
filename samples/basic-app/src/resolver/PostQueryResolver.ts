import {app} from "../app"
import {PostRepository} from "../repository";

const PostQueryResolver = app
  .query("post")
  .resolve(({ id }) => {
    return PostRepository.findOneOrFail(id)
  })

