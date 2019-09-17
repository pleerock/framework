import {ApplicationProperties, ContextList} from "../app";
import {Errors} from "../errors";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";
import {EntityResolveSchema, EntitySchema} from "./entities";
import {Input, Model} from "./operators";
import {ModelDataLoaderResolverSchema, ModelResolverSchema} from "./resolvers";
import {DeclarationSelection, DeclarationSelectorResult, executeQuery, ModelSelector} from "./selection";
import {InputValidator, ModelValidator, ValidationSchema, ValidatorOptions} from "./validators";

/**
 * Models helper - allows to define resolver for them or select data from the client.
 */
export class ModelManager<
  M extends Model<any>,
  Context extends ContextList
  > {
  appProperties: ApplicationProperties
  name: string
  model: M
  validators: ModelValidator<M["blueprint"]>[] = []

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    model: M,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.model = model
  }

  validator(
    schema: ValidationSchema<M["blueprint"]>,
    options?: ValidatorOptions
  ): this {
    const validator = new ModelValidator<M["blueprint"]>(this.model, schema, options)
    this.validators.push(validator)
    return this
  }

  resolve(
    schema: ModelResolverSchema<M["blueprint"], Context>,
    dataLoaderSchema?: ModelDataLoaderResolverSchema<M["blueprint"], Context>,
  ): this {
    this.appProperties.resolvers.push({
      type: "model",
      name: this.name as string,
      schema: schema,
      dataLoaderSchema: dataLoaderSchema,
    })
    return this
  }

  one<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ): ModelSelector<M, Context, Selection, DeclarationSelectorResult<M, Selection>> {
    return new ModelSelector(
      this.appProperties,
      "one",
      "_model_" + this.name + "_one",
      selection,
    )
  }

  many<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ): ModelSelector<M, Context, Selection, DeclarationSelectorResult<M, Selection>[]> {
    return new ModelSelector(
      this.appProperties,
      "many",
      "_model_" + this.name + "_many",
      selection,
    )
  }

  count<Selection extends DeclarationSelection<M, true>>(
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

  save<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ) {
    const that = this
    return {
      fetch(): Promise<DeclarationSelectorResult<M, Selection>> {
        return executeQuery(that.appProperties.client, "mutation", that.name as string, selection)
      }
    }
  }

  remove<Selection extends DeclarationSelection<M, true>>(
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
export class InputManager<
  I extends Input<any>,
  Context extends ContextList
  > {
  appProperties: ApplicationProperties
  name: string
  input: I
  validators: InputValidator<I["blueprint"]>[] = []

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    input: I,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.input = input
  }

  validator(
    schema: ValidationSchema<I["blueprint"]>,
    options?: ValidatorOptions
  ): this {
    this.validators.push(new InputValidator<I["blueprint"]>(this.input, schema, options))
    return this
  }

}

/**
 * Entity helper.
 */
export class ModelEntity<
  GivenModel extends Model<any>
> {
  appProperties: ApplicationProperties
  entityResolveSchema?: EntityResolveSchema<GivenModel["blueprint"]>
  tableName?: string
  model: Model<any>
  entitySchema?: EntitySchema<GivenModel["blueprint"]>

  constructor(
    appProperties: ApplicationProperties,
    model: Model<any>
  ) {
    this.appProperties = appProperties
    this.model = model
  }

  resolvable(schema: EntityResolveSchema<GivenModel["blueprint"]>): ModelEntity<GivenModel> {
    this.entityResolveSchema = schema
    return this
  }

  table(name: string): this {
    this.tableName = name
    return this
  }

  schema(schema: EntitySchema<GivenModel["blueprint"]>): ModelEntity<GivenModel> {
    this.entitySchema = schema
    return this
  }

  get repository() {
    if (!this.appProperties.dataSource)
      throw Errors.noDataSourceInApp

    return this.appProperties.dataSource.getRepository(this.model.name)
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
