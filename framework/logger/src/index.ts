import {Logger} from "@microframework/core";
import {AnyApplication} from "@microframework/core/_";
const debug = require("debug");

export const debugLogger: Logger = {

  log(name: string, message: string) {
    return debug(name)(message)
  },

  error(name: string, message: string) {
    return debug(name)(message)
  },

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

  logActionResponse({
    app,
    route,
    method,
    content,
  }) {
    content = typeof content === "object" ? JSON.stringify(content) : content
    return debug(`microframework:action:${route} (${method})`)(content)
  },

  logGraphQLResponse({
    app,
    name,
    propertyName,
    args,
    context,
    info,
    request,
    content,
  }) {
    const type = name === "Query" || name === "Mutation" ? name.toLowerCase() : `model:${name}`
    content = typeof content === "object" ? JSON.stringify(content) : content
    return debug(`microframework:${type}${propertyName ? ":" + propertyName : ""}`)(`${JSON.stringify(args)}: ${content}`)
  }

}
