import {DeclarationBlueprint} from "./declarations";
import {ContextList, InputList, ModelList} from "./ApplicationOptions";
import {ModelResolverSchema, Resolver} from "./resolvers";
import {DeclarationSelection, DeclarationSelector, DeclarationSelectorResult, executeQuery} from "./selection";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";
import {ApplicationClient} from "../client";
import {Input, Model} from "./operators";
import {Blueprint, BlueprintCondition, BlueprintOrdering, InputBlueprint} from "./core";

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
  client: ApplicationClient | undefined
  
  constructor(
    type: "query" | "mutation",
    name: DeclarationName,
    client: ApplicationClient | undefined,
  ) {
    this.type = type
    this.name = name
    this.client = client
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
  client: ApplicationClient | undefined

  constructor(
    name: ModelName,
    model: Model<ModelBlueprint>,
    client: ApplicationClient | undefined,
  ) {
    this.name = name
    this.model = model
    this.client = client
  }

  one<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ): Promise<DeclarationSelectorResult<Models, ModelName, Selection>> {
    return executeQuery(this.client, "query", "_model_" + this.name + "_one", selection)
  }

  many<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ): Promise<DeclarationSelectorResult<Models, ModelName, Selection>[]> {
    return executeQuery(this.client, "query", "_model_" + this.name + "_many", selection)
  }

  count<Selection extends DeclarationSelection<Models[ModelName]>>(
    selection: Selection,
    where: BlueprintCondition<Models[ModelName]["blueprint"]>
  ): Promise<number> {
    return executeQuery(this.client, "query", "_model_" + this.name + "_count", selection, where)
      .then(result => result.count)
  }

  save<Selection extends DeclarationSelection<Models[ModelName]>>(
    model: Models[ModelName],
    selection: Selection
  ): Promise<DeclarationSelectorResult<Models, ModelName, Selection>> {
    return executeQuery(this.client, "mutation", "_model_" + this.name + "_save", selection, model)
  }

  remove(id: any): Promise<void> {
    return executeQuery(this.client, "mutation", "_model_" + this.name + "_remove", { select: { status: true } }, id)
  }

}

/**
 * Input helper.
 */
export class InputHelper<
  Inputs extends InputList,
  InputName extends keyof Inputs,
  SelectedInputBlueprint extends InputBlueprint,
  Context extends ContextList
  > {
  name: InputName
  input: Input<SelectedInputBlueprint>
  client: ApplicationClient | undefined

  constructor(
    name: InputName,
    input: Input<SelectedInputBlueprint>,
    client: ApplicationClient | undefined,
  ) {
    this.name = name
    this.input = input
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
