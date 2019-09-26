import {SelectionType} from "@microframework/core";
import {postsQuery} from "..";

export type PostsQueryType = SelectionType<typeof postsQuery>
