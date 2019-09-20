import {Connection} from "typeorm";
import {ApplicationClient} from "../client";
import {ContextResolver} from "../context";
import {ModelEntity} from "../entity";
import {ActionManager, DeclarationManager, InputManager, ModelManager} from "../manager";
import {Validator} from "../validation";
import {NamingStrategy} from "./NamingStrategy";

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
   * Validation library to be used for model and inputs validation.
   */
  validator?: Validator

  /**
   * Strategy for naming special identifiers used in the framework.
   */
  namingStrategy: NamingStrategy

  /**
   * Context data.
   */
  context: ContextResolver<any>

  /**
   * List of registered entities.
   */
  readonly entities: ModelEntity<any>[]

  /**
   * List of declaration managers.
   */
  readonly declarationManagers: DeclarationManager<any, any>[]

  /**
   * List of action managers.
   */
  readonly actionManagers: ActionManager<any, any>[]

  /**
   * List of model managers.
   */
  readonly modelManagers: ModelManager<any, any>[]

  /**
   * List of input managers.
   */
  readonly inputManagers: InputManager<any, any>[]
}
