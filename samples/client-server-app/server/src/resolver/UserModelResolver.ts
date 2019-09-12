import {app} from "@framework-sample/client-server-app-shared";

export const UserModelResolver = app
  .model("UserModel")
  .resolve({
    fullName(user, { includeId }) {
      if (includeId) {
        return `${user.id}) ${user.firstName} ${user.lastName}`
      }
      return `${user.firstName} ${user.lastName}`
    }
  })
