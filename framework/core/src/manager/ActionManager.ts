import {Action, ActionType, ApplicationProperties, ContextList} from "../app";
import {ActionResolverFn, AnyBlueprintType, executeAction, Resolver} from "../types";

/**
 * Action manager provides functionality over defined action routes.
 */
export class ActionManager<
  A extends Action,
  Context extends ContextList
  > {

  /**
   * Application's properties.
   */
  readonly appProperties: ApplicationProperties

  /**
   * Action name (route).
   */
  readonly name: string

  /**
   * Action name (route).
   */
  readonly action: A

  /**
   * List of registered model and root query/mutation resolvers.
   */
  readonly resolvers: Resolver[] = []

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    action: A,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.action = action
  }

  /**
   * Defines a resolver for the current declaration.
   */
  resolve(resolver: ActionResolverFn<Action, Context>): this {
    this.resolvers.push({
      type: "action",
      name: this.name,
      resolverFn: resolver as any
    })
    return this
  }

  /**
   * Fetches the selected data.
   */
  async fetch(values: ActionType<Action>): Promise<AnyBlueprintType<Action["return"]>> {
    return executeAction(this.appProperties.client, this.name as string, this.action.type as string, values)
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: Action["return"]) => any) {
  }

}
