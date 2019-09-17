import { app } from "../app";

app
  .entity("UserModel")
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
