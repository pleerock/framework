import {ContextList, DeclarationBlueprint, InputList, ModelList} from "./ApplicationTypes";

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

}

/**
 * Handy way of using ApplicationOptions when its generics aren't necessary.
 */
export type AnyApplicationOptions = ApplicationOptions<any, any, any, any, any>
