import "@microframework/core";
import {app} from "../";

export const postsCountQuery = ({ name }: { name: string }) => app
  .model("PostModel")
  .count({ name })
