import {Action, ActionType, ApplicationProperties, ContextList} from "../app";
import {ActionResolverFn, AnyBlueprint, AnyBlueprintType, executeAction, Resolver} from "../types";

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
  resolve(resolver: ActionResolverFn<A, Context>): Resolver {
    return new Resolver({
      type: "action",
      name: this.name,
      resolverFn: resolver as any
    })
  }

  /**
   * Fetches the selected data.
   */
  async fetch(values: ActionType<A>): Promise<A["return"] extends AnyBlueprint ? AnyBlueprintType<A["return"]> : void> {
    return executeAction(this.appProperties.client, this.name as string, this.action.type as string, values)
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: A["return"]) => any) {
  }

}
