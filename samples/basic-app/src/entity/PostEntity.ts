import {entity, RelationTypes} from "@framework/server";
import {PostModel} from "../model/PostModel";

// todo: maybe app.model("PostModel").entity() ?
// todo: but why do we really need this app.model syntax? Maybe standalone resolve method?
// todo: but we need it to make queries and mutations possible
export const PostEntity = entity(PostModel, {
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
})
