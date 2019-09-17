import {ContextList} from "../app";
import {ApplicationProperties} from "../app";
import {AnyBlueprint, DeclarationResolverFn, DeclarationSelection, DeclarationSelector} from "../types";

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
  appProperties: ApplicationProperties

  /**
   * Indicates if this declaration is a query or a mutation.
   */
  type: "query" | "mutation"

  /**
   * Query / mutation name.
   */
  name: string

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
   * Allows to define a resolver for the current declaration.
   */
  resolve(resolver: DeclarationResolverFn<Declaration, Context>): this {
    this.appProperties.resolvers.push({
      type: this.type,
      name: this.name,
      resolverFn: resolver as any
    })
    return this
  }

}
