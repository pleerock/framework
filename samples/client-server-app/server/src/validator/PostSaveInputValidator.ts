import {app} from "@microframework-sample/client-server-app-shared";

app
  .input("PostSaveInput")
  .validator({
    name: {
      minLength: 1
    },
    description: {
      minLength: 5
    },
  })
