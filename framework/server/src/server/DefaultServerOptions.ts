import {ContextList} from "@framework/core";
import {Connection} from "typeorm";

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
   * TypeORM connection to be used to register entities and automatically resolve relations.
   */
  typeormConnection?: Connection

  /**
   * Port on which to run express server.
   */
  port: number

  /**
   * Route on which to register a graphql requests.
   */
  route?: string
}
