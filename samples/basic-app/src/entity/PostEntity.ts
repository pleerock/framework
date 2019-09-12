import {entity, RelationTypes} from "@framework/server";
import {PostModel} from "../model/PostModel";
import {app} from "../app";

export const PostEntity = entity(
  app.model("PostModel"),
  {
    resolve: {
      author: true
    },
    model: {
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
        relation: RelationTypes.ManyToOne,
        // with: "UserModel"
      }
    },
  }
)
