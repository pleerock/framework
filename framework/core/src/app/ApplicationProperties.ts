import {Connection} from "typeorm";
import {ApplicationClient} from "../client";
import {DeclarationManager} from "../declaration";
import {InputManager, ModelEntity, ModelManager} from "../types/helpers";
import {ContextResolver, Resolver} from "../types/resolvers";
import {InputValidator, ModelValidator} from "../types/validators";

/**
 * Main Application properties.
 */
export type ApplicationProperties = {

  /**
   * Client used in the application.
   */
  client?: ApplicationClient

  /**
   * ORM data source (connection) used in the application.
   */
  dataSource?: Connection

  /**
   * Context data.
   */
  context: ContextResolver<any>

  /**
   * List of registered model and root query/mutation resolvers.
   */
  readonly resolvers: Resolver[]

  /**
   * List of registered entities.
   */
  readonly entities: ModelEntity<any>[]

  /**
   * List of declaration managers.
   */
  readonly declarationManagers: DeclarationManager<any, any>[]

  /**
   * List of model managers.
   */
  readonly modelManagers: ModelManager<any, any>[]

  /**
   * List of input managers.
   */
  readonly inputManagers: InputManager<any, any>[]
}
