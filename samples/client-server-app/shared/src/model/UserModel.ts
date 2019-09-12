import {model, args} from "@framework/core";

export const UserModel = model("UserModel", {
  id: Number,
  firstName: String,
  lastName: String,
  fullName: args(String, {
    includeId: Boolean
  })
})
