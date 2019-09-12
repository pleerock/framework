import {entity, RelationTypes} from "@framework/server";
import {app} from "@framework-sample/client-server-app-shared";

export const PostEntity = entity(
  app.model("PostModel"), 
  {
    resolve: true,
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
