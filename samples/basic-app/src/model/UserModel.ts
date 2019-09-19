import {model} from "@microframework/core";

export const UserModel = model("UserModel", {
  id: Number,
  firstName: String,
  lastName: String,
})
