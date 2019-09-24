import {args, array, Application, optional} from "@microframework/core"
import {PostModel} from "./model/PostModel";
import {PostSaveInput} from "./input/PostSaveInput";
import {UserModel} from "./model/UserModel";

export const app = new Application({
  queries: {
    posts: args(array(PostModel), {
      offset: optional(Number),
      limit: Number
    }),
    post: args(optional(PostModel), {
      id: Number,
    }),
  },
  mutations: {
    savePost: args(PostModel, PostSaveInput),
    deletePost: args(PostModel, {
      id: Number,
    }),
  },
  models: {
    PostModel,
    UserModel,
  },
  inputs: {
    PostSaveInput,
  },
  context: {
    currentUser: UserModel
  }
})
