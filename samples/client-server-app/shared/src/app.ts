import {args, array, createApp, Application} from "@microframework/core"
import {PostModel} from "./model/PostModel";
import {PostSaveInput} from "./input/PostSaveInput";
import {UserModel} from "./model/UserModel";

export const app = new Application({
  queries: {
    posts: array(PostModel),
    post: args(PostModel, {
      id: Number,
    })
  },
  mutations: {
    savePost: args(PostModel, {
      post: PostSaveInput
    }),
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
