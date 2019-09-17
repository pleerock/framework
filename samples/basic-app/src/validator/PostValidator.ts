import {app} from "../app";

app
  .model("PostModel")
  .validator({
    name: {
      minLength: 10,
      maxLength: 100
    },
    description: {
      minLength: 100,
      maxLength: 10000
    }
  })
