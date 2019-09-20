import {args, array, createApp} from "@microframework/core"
import {PostModel} from "./model/PostModel";
import {PostSaveInput} from "./input/PostSaveInput";
import {UserModel} from "./model/UserModel";

export const app = createApp({
  actions: {
    "/users": {
      type: "GET",
      return: array(UserModel)
    }
  },
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
  },
})
