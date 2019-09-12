import {PostModelResolver} from "./PostModelResolver";
import {PostsQueryResolver} from "./PostsQueryResolver";
import {PostQueryResolver} from "./PostQueryResolver";
import {PostSaveMutationResolver} from "./PostSaveMutationResolver";
import {UserModelResolver} from "./UserModelResolver";

export const Resolvers = [
  PostModelResolver,
  PostsQueryResolver,
  PostQueryResolver,
  PostSaveMutationResolver,
  UserModelResolver,
]
