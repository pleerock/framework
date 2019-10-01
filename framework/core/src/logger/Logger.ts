import {AnyApplication} from "../app";

/**
 * Logger interface.
 */
export type Logger = {

  log(name: string, message: string): void
  error(name: string, message: string): void

  resolveQuery(args: {
    app: AnyApplication
    propertyName: string
    args: any
    context: any
    info: any
    request: any
  }): void
  resolveQueryError(args: {
    app: AnyApplication
    propertyName: string
    error: string
    args: any
    context: any
    info: any
    request: any
  }): void

  resolveMutation(args: {
    app: AnyApplication
    propertyName: string
    args: any
    context: any
    info: any
    request: any
  }): void
  resolveMutationError(args: {
    app: AnyApplication
    propertyName: string
    error: string
    args: any
    context: any
    info: any
    request: any
  }): void

  resolveModel(args: {
    app: AnyApplication
    name: string
    propertyName: string
    parent: any
    args: any
    context: any
    info: any
    request: any
  }): void
  resolveModelError(args: {
    app: AnyApplication
    name: string
    propertyName: string
    error: string
    parent: any
    args: any
    context: any
    info: any
    request: any
  }): void

  resolveAction(args: {
    app: AnyApplication
    route: string
    method: string
    request: any
  }): void
  resolveActionError(args: {
    app: AnyApplication
    route: string
    method: string
    error: string
    request: any
  }): void

  logActionResponse(args: {
    app: AnyApplication
    route: string
    method: string
    content: any
    request: any
  }): void
  logGraphQLResponse(args: {
    app: AnyApplication
    name: string
    propertyName: string
    parent?: any
    args: any
    context: any
    info: any
    request: any
    content: any
  }): void

}
