import {Logger} from "@microframework/core";
const debug = require("debug");

export const debugLogger: Logger = {

  resolveQuery({ propertyName, args }) {
    return debug(`microframework:query:${propertyName}`)(`${JSON.stringify(args)}`)
  },
  resolveQueryError({ propertyName, error }) {
    error = typeof error === "object" ? JSON.stringify(error) : error
    return debug(`microframework:query:${propertyName}`)(error)
  },

  resolveMutation({ propertyName, args }) {
    return debug(`microframework:mutation:${propertyName}`)(`${JSON.stringify(args)}`)
  },
  resolveMutationError({ propertyName, error }) {
    error = typeof error === "object" ? JSON.stringify(error) : error
    return debug(`microframework:mutation:${propertyName}`)(error)
  },

  resolveModel({ name, propertyName, args }) {
    return debug(`microframework:model:${name}:${propertyName}`)(`${JSON.stringify(args)}`)
  },
  resolveModelError({ name, propertyName, error }) {
    error = typeof error === "object" ? JSON.stringify(error) : error
    return debug(`microframework:model:${name}:${propertyName}`)(error)
  },

  resolveAction({ method, route }) {
    return debug(`microframework:action:${route} (${method})`)("")
  },
  resolveActionError({ method, route, error }) {
    error = typeof error === "object" ? JSON.stringify(error) : error
    return debug(`microframework:action:${route} (${method})`)(error)
  },
}
