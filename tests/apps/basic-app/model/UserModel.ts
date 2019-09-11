import {model} from "../../../../src/app";

export const UserModel = model("UserModel", {
  id: Number,
  firstName: String,
  lastName: String,
})
