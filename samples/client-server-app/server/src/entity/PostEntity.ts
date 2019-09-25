import {app} from "@microframework-sample/client-server-app-shared";

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
    authorId: {
      type: "int",
      nullable: true
    },
    author: {
      relation: "many-to-one"
    }
  })
