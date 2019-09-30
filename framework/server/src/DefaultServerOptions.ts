import {ContextList} from "@microframework/core";
import {CorsOptions} from "cors";
import {PubSub} from "graphql-subscriptions";

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
   * Port on which to run websocket server.
   */
  websocketPort?: number

  /**
   * Route on which to register a graphql requests.
   * If not set, default is "/graphql".
   */
  route?: string

  /**
   * Route on which to register a subscriptions websocket interface.
   * If not set, default is "/subscriptions".
   */
  subscriptionsRoute?: string

  /**
   * Should be set to true to enable cors.
   */
  cors?: boolean | CorsOptions

  /**
   * Indicates if graphiQL should be enabled or not.
   */
  graphiql?: boolean

  /**
   * Indicates if playground should be enabled or not.
   */
  playground?: boolean

  /**
   * PubSub to be used for subscriptions.
   */
  pubSub?: PubSub

}
