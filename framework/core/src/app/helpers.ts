import {DeclarationBlueprint} from "./declarations";
import {ContextList, ModelList} from "./ApplicationOptions";
import {ModelResolverSchema, Resolver} from "./resolvers";
import {DeclarationSelection, DeclarationSelector} from "./selection";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";
import {ApplicationClient} from "../client";
import {Model} from "./operators";
import {Blueprint} from "./core";

/**
 * Declarations (root queries and mutations) helper -
 * allows to define a resolver for them or select data from the client.
 */
export class DeclarationHelper<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList
> {
  type: "query" | "mutation"
  name: DeclarationName
  private client: ApplicationClient | undefined
  
  constructor(
    type: "query" | "mutation",
    name: DeclarationName,
    client: ApplicationClient | undefined,
  ) {
    this.type = type
    this.name = name
    this.client = client
  }

  select<Selection extends DeclarationSelection<AllDeclarations[DeclarationName]>>(options: Selection)
    : DeclarationSelector<AllDeclarations, DeclarationName, Selection> {
    return new DeclarationSelector(
      this.type,
      this.name,
      options,
      this.client
    )
  }
}

/**
 * Models helper - allows to define resolver for them or select data from the client.
 */
export class ModelHelper<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList
  > {
  name: ModelName
  model: Model<ModelBlueprint>
  private client: ApplicationClient | undefined

  constructor(
    name: ModelName,
    model: Model<ModelBlueprint>,
    client: ApplicationClient | undefined,
  ) {
    this.name = name
    this.model = model
    this.client = client
  }

  // todo: probably to be able to implement data loader we need to create a separate resolveWithDataLoader method
  // todo: implement model selections? YES!
}

/**
 * Aggregations helper - allows to select aggregations from the client.
 */
export class AggregateHelper<T extends AggregateOptions> {
  constructor(
    private options: T,
    private client: ApplicationClient | undefined,
  ) {
  }

  fetch(): Promise<AggregateOptionsType<T>> {
    if (!this.client)
      throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

    // return this.client.fetch()
    return Promise.resolve() as any
  }
}
