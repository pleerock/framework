import {app} from "@microframework-sample/client-server-app-shared";

export const UploadActionResolver = app
  .action("/upload")
  .resolve((_, { request, response }) => {
      console.log(request.file)
      return "success"
  })
