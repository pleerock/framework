import {args, array, Application, nullable} from "@microframework/core"
import {PostModel} from "./model/PostModel";
import {PostSaveInput} from "./input/PostSaveInput";
import {UserModel} from "./model/UserModel";

export const app = new Application({
  queries: {
    posts: args(array(PostModel), {
      offset: nullable(Number),
      limit: Number
    }),
    post: args(PostModel, {
      id: Number,
    }),
    checkPosts: { status: Boolean }
  },
  mutations: {
    savePost: args(PostModel, PostSaveInput),
    deletePost: args(PostModel, {
      id: Number,
    }),
  },
  subscriptions: {
    postAdded: PostModel,
    postRemoved: Number,
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
  // allowedQueries: [ // this creates a circular references for us, think about it
  //   postModelQuery,
  //   postsQuery
  // ]
})
