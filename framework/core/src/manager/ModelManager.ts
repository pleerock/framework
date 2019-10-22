import {Repository} from "typeorm";
import {ApplicationProperties, ContextList} from "../app";
import {ModelEntity} from "../entity";
import {Errors} from "../errors";
import {CustomRepositoryFactory} from "../repository";
import {ModelSelector} from "../selection/ModelSelector";
import {
  AnyBlueprintType, BlueprintCondition,
  DeclarationSelection,
  DeclarationSelectorResult,
  executeQuery,
  Model,
  ModelDataLoaderResolverSchema,
  ModelResolverSchema, ModelType,
  Resolver,
} from "../types";
import {ModelValidator, ValidationSchema} from "../validation";

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
  validator(schema: ValidationSchema<M["blueprint"], Context>): ModelValidator<M, Context> {
    return new ModelValidator(this.model, schema)
  }

  /**
   * Returns an entity builder for a given defined model.
   */
  entity(): ModelEntity<M> {
    return new ModelEntity(this.appProperties, this.model)
  }

  /**
   * Returns entity repository for a given defined model together with defined custom repository functions.
   */
  repository<CustomRepositoryDefinition>(customRepository?: CustomRepositoryFactory<Repository<ModelType<M>>, CustomRepositoryDefinition>): Repository<ModelType<M>> & CustomRepositoryDefinition {
    return new Proxy({} as any, {
      get: (obj, prop) => {
        if (!obj.repository) {
          if (!this.appProperties.dataSource)
            throw Errors.noDataSourceInApp()

          const ormRepository = this.appProperties.dataSource.getRepository<any>(this.name as string)
          if (customRepository) {
            obj.repository = Object.assign(
              new (ormRepository.constructor as any)(),
              ormRepository,
              customRepository(ormRepository)
            )
          } else {
            obj.repository = ormRepository
          }
        }

        return obj.repository[prop]
      }
    })
  }

  /**
   * To improve resolvers performance when different property resolvers rely on the same data,
   * but this data has computation costs, we can use this method to execute computations
   * before resolving each property. Then we'll be able to access our properties in the resolver.
   *
   * todo
   */
  beforeResolve(callback: (context: AnyBlueprintType<Context>) => any) {

  }

  /**
   * Defines a resolver for the model.
   */
  resolve(
    schema: ModelResolverSchema<M["blueprint"], Context>,
    dataLoaderSchema?: ModelDataLoaderResolverSchema<M["blueprint"], Context>,
  ): Resolver {
    return new Resolver({
      type: "model",
      name: this.name,
      schema: schema,
      dataLoaderSchema: dataLoaderSchema,
    })
  }

  /**
   * Returns a model fetcher to select one model.
   */
  one<Selection extends DeclarationSelection<M, true>>(
    selection: Selection
  ): ModelSelector<M, Context, Selection, DeclarationSelectorResult<M, Selection>> {
    return new ModelSelector(
      this.appProperties,
      this.appProperties.namingStrategy.generatedModelDeclarations.one(this.name),
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
      this.appProperties.namingStrategy.generatedModelDeclarations.many(this.name),
      selection,
    )
  }

  /**
   * Returns a model fetcher to select a models count.
   */
  count<Condition extends BlueprintCondition<M["blueprint"]>>(
    condition: Condition
  ) {
    const that = this
    return {
      fetch(): Promise<number> {
        return executeQuery(
          that.appProperties.client,
          "query",
          that.appProperties.namingStrategy.generatedModelDeclarations.count(that.name),
          {
            select: {
              count: true
            },
            args: {
              ...condition
            }
          }
        )
          .then(result => result.count)
      }
    }
  }

  /**
   * Returns a model fetcher to save a model.
   */
  save<Selection extends DeclarationSelection<M, false>>(
    model: Partial<AnyBlueprintType<M>>,
    selection: Selection
  ) {
    const that = this
    return {
      fetch(): Promise<DeclarationSelectorResult<M, Selection>> {
        return executeQuery(
          that.appProperties.client,
          "mutation",
          that.appProperties.namingStrategy.generatedModelDeclarations.save(that.name),
          {
            select: selection.select,
            args: {
              ...model
            }
          }
        )
      }
    }
  }

  /**
   * Returns a model fetcher to remove a model.
   */
  remove<Condition extends BlueprintCondition<M["blueprint"]>>(
    condition: Condition
  ) {
    const that = this
    return {
      fetch(): Promise<void> {
        return executeQuery(
          that.appProperties.client,
          "mutation",
          that.appProperties.namingStrategy.generatedModelDeclarations.remove(that.name),
          {
            select: {
              status: true
            },
            args: {
              ...condition
            }
          }
        )
          .then(() => {})
      }
    }
  }

}
