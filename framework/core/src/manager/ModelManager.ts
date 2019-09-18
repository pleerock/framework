import {ApplicationProperties, ContextList} from "../app";
import {ModelSelector} from "../selection/ModelSelector";
import {
  DeclarationSelection,
  DeclarationSelectorResult,
  executeQuery,
  Model,
  ModelDataLoaderResolverSchema,
  ModelResolverSchema,
  Resolver,
} from "../types";
import {ModelValidator, ValidationSchema, ValidatorOptions} from "../validation";

/**
 * Models manager - allows to define resolver for the models and select data from the client.
 */
export class ModelManager<
  M extends Model<any>,
  Context extends ContextList
> {

  /**
   * Application's properties.
   */
  readonly appProperties: ApplicationProperties

  /**
   * Model name.
   */
  readonly name: string

  /**
   * Model instance.
   */
  readonly model: M

  /**
   * List of model validators.
   */
  readonly validators: ModelValidator<M["blueprint"]>[] = []

  /**
   * List of registered model and root query/mutation resolvers.
   */
  readonly resolvers: Resolver[] = []

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    model: M,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.model = model
  }

  /**
   * Registers a new model validator.
   */
  validator(
    schema: ValidationSchema<M["blueprint"]>,
    options?: ValidatorOptions
  ): this {
    const validator = new ModelValidator(this.model, schema, options)
    this.validators.push(validator)
    return this
  }

  /**
   * Defines a resolver for the model.
   */
  resolve(
    schema: ModelResolverSchema<M["blueprint"], Context>,
    dataLoaderSchema?: ModelDataLoaderResolverSchema<M["blueprint"], Context>,
  ): this {
    this.resolvers.push({
      type: "model",
      name: this.name as string,
      schema: schema,
      dataLoaderSchema: dataLoaderSchema,
    })
    return this
  }

  /**
   * Returns a model fetcher to select one model.
   */
  one<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ): ModelSelector<M, Context, Selection, DeclarationSelectorResult<M, Selection>> {
    return new ModelSelector(
      this.appProperties,
      "_model_" + this.name + "_one",
      selection,
    )
  }

  /**
   * Returns a model fetcher to select many models.
   */
  many<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ): ModelSelector<M, Context, Selection, DeclarationSelectorResult<M, Selection>[]> {
    return new ModelSelector(
      this.appProperties,
      "_model_" + this.name + "_many",
      selection,
    )
  }

  /**
   * Returns a model fetcher to select a models count.
   */
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

  /**
   * Returns a model fetcher to save a model.
   */
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

  /**
   * Returns a model fetcher to remove a model.
   */
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