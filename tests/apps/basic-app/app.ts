import {array, createApp, mutations, queries,} from "../../../src/app"
import {PostModel} from "./model/PostModel";
import {PostSaveInput} from "./input/PostSaveInput";
import {UserModel} from "./model/UserModel";

// todo: think if we can use blueprint here as well, instead of return and args syntax
export const app = createApp({
  queries: queries({
    posts: {
      return: array(PostModel),
    },
    post: {
      args: {
        id: Number,
      },
      return: PostModel,
    },
  }),
  mutations: mutations({
    savePost: {
      args: {
        post: PostSaveInput
      },
      return: PostModel,
    },
    deletePost: {
      args: {
        id: Number,
      },
      return: PostModel,
    },
  }),
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
