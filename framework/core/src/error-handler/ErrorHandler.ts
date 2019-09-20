import {AnyApplication} from "../app";

/**
 * Error handling interface.
 */
export type ErrorHandler = {

  actionError(options: {
    app: AnyApplication
    route: string
    method: string
    error: string
    request: any
    response: any
  }): void

  resolverError(options: {
    app: AnyApplication
    name: string
    propertyName: string
    parent: any
    args: any
    context: any
    info: any
    error: string
    request: any
  }): void

}
