import {app} from "@framework-sample/client-server-app-shared";
import { resolve } from "@framework/core";

export const UserModelResolver = resolve(
  app.model("UserModel"),
  {
    fullName(user, { includeId }) {
      if (includeId) {
        return `${user.id}) ${user.firstName} ${user.lastName}`
      }
      return `${user.firstName} ${user.lastName}`
    }
  }
)
