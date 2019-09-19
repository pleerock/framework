import {app} from "@microframework-sample/client-server-app-shared";

app
  .model("PostModel")
  .validator({
    name: {
      minLength: 3,
      maxLength: 100
    },
    description: {
      minLength: 2,
      maxLength: 10000
    }
  })
