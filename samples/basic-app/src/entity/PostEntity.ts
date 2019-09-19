import {PostModel} from "../model/PostModel";
import {app} from "../app";

app
  .entity("PostModel")
  .resolvable(true)
  .schema({
    id: {
      type: "int",
      primary: true,
      generated: "increment"
    },
    name: {
      type: "varchar"
    },
    description: {
      type: "text"
    },
    likes: {
      type: "int"
    },
    author: {
      relation: "many-to-one" as const,
      // with: "UserModel"
    }
  })
