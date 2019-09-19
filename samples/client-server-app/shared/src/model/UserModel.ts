import {model, args} from "@microframework/core";

export const UserModel = model("UserModel", {
  id: Number,
  firstName: String,
  lastName: String,
  fullName: args(String, {
    includeId: Boolean
  })
})
