import {app} from "@framework-sample/client-server-app-shared";

app
  .entity("UserModel")
  .resolvable(true)
  .schema({
    id: {
      type: "int",
      primary: true,
      generated: "increment"
    },
    firstName: {
      type: "varchar"
    },
    lastName: {
      type: "varchar"
    },
  })
