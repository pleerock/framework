import {DeclarationBlueprint} from "./declarations";
import {Input, Model} from "./operators";
import {Blueprint, BlueprintPrimitiveProperty} from "./core";

/**
 * List of models for application.
 */
export type ModelList = {
  [key: string]: Model<any>
}

/**
 * List of inputs for application.
 */
export type InputList = {
  [key: string]: Input<any>
}

/**
 * List of context variables.
 */
export type ContextList = {
  [key: string]:
    | Model<any>
    | Blueprint
    | BlueprintPrimitiveProperty
}

/**
 * Application options passed to the main application entry point.
 */
export type ApplicationOptions<
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
> = {

  /**
   * List of GraphQL queries defined in the app.
   */
  queries: Queries

  /**
   * List of GraphQL mutations defined in the app.
   */
  mutations: Mutations

  /**
   * List of models in the application.
   */
  models: Models

  /**
   * List of inputs in the application.
   */
  inputs: Inputs

  /**
   * List of context variables used in the resolvers.
   */
  context?: Context

  // we probably will need list of entities on this level as well,
  // so if we do, then maybe its better to specify list of models that are entities
  // to avoid underlying implementation go to the clients

}

/**
 * Handy way of using ApplicationOptions when its generics aren't necessary.
 */
export type AnyApplicationOptions = ApplicationOptions<any, any, any, any, any>
