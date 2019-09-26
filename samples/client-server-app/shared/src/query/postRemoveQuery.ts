import "@microframework/core";
import {PostType} from "..";
import { app } from "../app";

export const postRemoveQuery = (id: number) => app
  .model("PostModel")
  .remove({ id })

