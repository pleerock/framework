import {ApplicationProperties, ContextList} from "../app";
import {DeclarationSelector} from "../selection/DeclarationSelector";
import {AnyBlueprint, DeclarationResolverFn, DeclarationSelection, Resolver} from "../types";

/**
 * Declarations (root queries and mutations) manager -
 * allows to define a resolver for them or select data from the client.
 */
export class DeclarationManager<
  Declaration extends AnyBlueprint,
  Context extends ContextList
  > {

  /**
   * Application's properties.
   */
  readonly appProperties: ApplicationProperties

  /**
   * Indicates if this declaration is a query or a mutation.
   */
  readonly type: "query" | "mutation"

  /**
   * Query / mutation name.
   */
  readonly name: string

  /**
   * List of registered model and root query/mutation resolvers.
   */
  readonly resolvers: Resolver[] = []

  constructor(
    appProperties: ApplicationProperties,
    type: "query" | "mutation",
    name: string,
  ) {
    this.appProperties = appProperties
    this.type = type
    this.name = name
  }

  /**
   * Creates a declaration selector that allows to select a data from the declaration on the remote.
   */
  select<Selection extends DeclarationSelection<Declaration>>(
    selection: Selection
  ): DeclarationSelector<Declaration, Selection> {
    return new DeclarationSelector(
      this.appProperties,
      this.type,
      this.name,
      selection,
    )
  }

  /**
   * Defines a resolver for the current declaration.
   */
  resolve(resolver: DeclarationResolverFn<Declaration, Context>): this {
    this.resolvers.push({
      type: this.type,
      name: this.name,
      resolverFn: resolver as any
    })
    return this
  }

}
