import {app} from "@microframework-sample/client-server-app-shared";

app
  .input("PostSaveInput")
  .validator({
    authorId(value, parent, context) {
      if (value !== context.currentUser.id)
        throw new Error("Cannot add a new post from a different user")

      return value
    },
    description: {
      minLength: 5
    },
  })
