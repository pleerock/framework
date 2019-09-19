import {ContextList} from "@microframework/core";
import {CorsOptions} from "cors";

/**
 * Server options.
 */
export type DefaultServerOptions<Context extends ContextList> = {

  /**
   * Custom express server instance.
   * You can create and configure your own instance of express and framework will use it.
   * If not passed, default express server will be used.
   */
  express?: any

  /**
   * Port on which to run express server.
   */
  port: number

  /**
   * Route on which to register a graphql requests.
   */
  route?: string

  /**
   * Should be set to true to enable cors.
   */
  cors?: boolean | CorsOptions

  /**
   * Indicates if graphiQL should be enabled or not.
   */
  graphiql?: boolean

}
