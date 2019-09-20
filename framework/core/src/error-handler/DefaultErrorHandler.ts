import {ErrorHandler} from "./ErrorHandler";

export const DefaultErrorHandler: ErrorHandler = {

  actionError({ error, response }) {
    response.status = 500
    response.json(error)
  },

  resolverError(options) {
    throw options.error
  }

}
