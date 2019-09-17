import {DeclarationBlueprint} from "./declarations";
import {ContextList, InputList, ModelList} from "./ApplicationOptions";
import {
  DeclarationSelection,
  DeclarationSelector,
  DeclarationSelectorResult,
  executeQuery,
  ModelSelector
} from "./selection";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";
import {ApplicationClient} from "../client";
import {Input, Model} from "./operators";
import {Blueprint, InputBlueprint} from "./core";
import {InputValidator, ModelValidator, ValidationSchema, ValidatorOptions} from "./validators";
import {DeclarationResolverFn, ModelDataLoaderResolverSchema, ModelResolverSchema} from "./resolvers";
import {EntityResolveSchema, EntitySchema} from "./entities";
import {ApplicationProperties} from "./ApplicationProperties";

/**
 * Declarations (root queries and mutations) helper -
 * allows to define a resolver for them or select data from the client.
 */
export class DeclarationHelper<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList
> {
  appProperties: ApplicationProperties
  type: "query" | "mutation"
  name: DeclarationName

  constructor(
    appProperties: ApplicationProperties,
    type: "query" | "mutation",
    name: DeclarationName,
  ) {
    this.appProperties = appProperties
    this.type = type
    this.name = name
  }

  select<Selection extends DeclarationSelection<AllDeclarations[DeclarationName]>>(
    selection: Selection
  ): DeclarationSelector<AllDeclarations, DeclarationName, Selection> {
    return new DeclarationSelector(
      this.appProperties,
      this.type,
      this.name,
      selection,
    )
  }

  resolve(resolver: DeclarationResolverFn<AllDeclarations, DeclarationName, Context>): this {
    this.appProperties.resolvers.push({
      type: this.type,
      name: this.name as string,
      resolverFn: resolver as any
    })
    return this
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
  appProperties: ApplicationProperties
  name: ModelName
  model: Model<ModelBlueprint>

  constructor(
    appProperties: ApplicationProperties,
    name: ModelName,
    model: Model<ModelBlueprint>,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.model = model
  }

  validator(
    schema: ValidationSchema<ModelBlueprint>,
    options?: ValidatorOptions
  ): this {
    const validator = new ModelValidator<ModelBlueprint>(this.model, schema, options)
    this.appProperties.modelValidators.push(validator)
    return this
  }

  resolve(
    schema: ModelResolverSchema<ModelBlueprint, Context>,
    dataLoaderSchema?: ModelDataLoaderResolverSchema<ModelBlueprint, Context>,
  ): this {
    this.appProperties.resolvers.push({
      type: "model",
      name: this.name as string,
      schema: schema,
      dataLoaderSchema: dataLoaderSchema,
    })
    return this
  }

  one<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ): ModelSelector<Models, ModelName, ModelBlueprint, Context, Selection, DeclarationSelectorResult<Models, ModelName, Selection>> {
    return new ModelSelector(
      this.appProperties,
      "one",
      "_model_" + this.name + "_one",
      selection,
    )
  }

  many<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ): ModelSelector<Models, ModelName, ModelBlueprint, Context, Selection, DeclarationSelectorResult<Models, ModelName, Selection>[]> {
    return new ModelSelector(
      this.appProperties,
      "many",
      "_model_" + this.name + "_many",
      selection,
    )
  }

  count<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ) {
    const that = this
    return {
      fetch(): Promise<number> {
        // todo: use { select: { count: true } } for selection>?
        return executeQuery(that.appProperties.client, "query", that.name as string, selection)
          .then(result => result.count)
      }
    }
  }

  save<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ) {
    const that = this
    return {
      fetch(): Promise<DeclarationSelectorResult<Models, ModelName, Selection>> {
        return executeQuery(that.appProperties.client, "mutation", that.name as string, selection)
      }
    }
  }

  remove<Selection extends DeclarationSelection<Models[ModelName], true>>(
    selection: Selection
  ) {
    const that = this
    return {
      fetch(): Promise<void> {
        // todo: use { select: { status: true } } for selection>?
        return executeQuery(that.appProperties.client, "mutation", that.name as string, selection)
          .then(() => {})
      }
    }
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
  appProperties: ApplicationProperties
  name: InputName
  input: Input<SelectedInputBlueprint>

  constructor(
    appProperties: ApplicationProperties,
    name: InputName,
    input: Input<SelectedInputBlueprint>,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.input = input
  }

  validator(
    schema: ValidationSchema<SelectedInputBlueprint>,
    options?: ValidatorOptions
  ): this {
    this.appProperties.inputValidators.push(new InputValidator<SelectedInputBlueprint>(this.input, schema, options))
    return this
  }

}

/**
 * Entity helper.
 */
export class EntityHelper<
  GivenModel extends Model<any>
> {
  entityResolveSchema?: EntityResolveSchema<GivenModel["blueprint"]>
  tableName?: string
  model: Model<any>
  entitySchema?: EntitySchema<GivenModel["blueprint"]>

  constructor(
    model: Model<any>
  ) {
    this.model = model
  }

  resolvable(schema: EntityResolveSchema<GivenModel["blueprint"]>): EntityHelper<GivenModel> {
    this.entityResolveSchema = schema
    return this
  }

  table(name: string): this {
    this.tableName = name
    return this
  }

  schema(schema: EntitySchema<GivenModel["blueprint"]>): EntityHelper<GivenModel> {
    this.entitySchema = schema
    return this
  }

}

/**
 * Aggregations helper - allows to select aggregations from the client.
 */
export class AggregateHelper<T extends AggregateOptions> {
  constructor(
    private appProperties: ApplicationProperties,
    private options: T,
  ) {
  }

  fetch(): Promise<AggregateOptionsType<T>> {
    if (!this.appProperties.client)
      throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

    // return this.client.fetch()
    return Promise.resolve() as any
  }
}
