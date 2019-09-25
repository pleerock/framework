import {Connection, Repository} from "typeorm";
import {AggregateHelper, AggregateOptions} from "../aggregate";
import {ApplicationClient} from "../client";
import {ContextResolver} from "../context";
import {ModelEntity} from "../entity";
import {DefaultErrorHandler, ErrorHandler} from "../error-handler";
import {Errors} from "../errors";
import {DefaultLogger, Logger} from "../logger";
import {ActionManager, DeclarationManager, InputManager, ModelManager} from "../manager";
import {CustomRepositoryFactory} from "../repository";
import {Input, InputReference, Model, ModelReference, ModelType} from "../types";
import {Validator} from "../validation";
import {ApplicationOptions} from "./ApplicationOptions";
import {ApplicationProperties} from "./ApplicationProperties";
import {ApplicationServer} from "./ApplicationServer";
import {ActionBlueprint, ContextList, DeclarationBlueprint, InputList, ModelList} from "./ApplicationTypes";
import {DefaultNamingStrategy} from "./DefaultNamingStrategy";

/**
 * Represents any application type.
 */
export type AnyApplication = Application<any, any, any, any, any, any>

/**
 * Application is a root point of the framework.
 */
export class Application<
  Actions extends ActionBlueprint,
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  > {

  /**
   * Application properties.
   */
  readonly properties: ApplicationProperties = {
    dataSource: undefined,
    namingStrategy: DefaultNamingStrategy,
    errorHandler: DefaultErrorHandler,
    logger: DefaultLogger,
    context: {},
    entities: [],
    declarationManagers: [],
    modelManagers: [],
    actionManagers: [],
    inputManagers: [],
  }

  /**
   * Application options.
   */
  readonly options: ApplicationOptions<
    Actions,
    Queries,
    Mutations,
    Models,
    Inputs,
    Context
  >

  constructor(options: ApplicationOptions<Actions, Queries, Mutations, Models, Inputs, Context>) {
    this.options = options
  }

  /**
   * Setups a client to be used by client application.
   */
  setupClient(client: ApplicationClient) {
    this.properties.client = client
    return this
  }

  /**
   * Sets a data source (orm connection) to be used by application.
   */
  dataSource(connection: Connection) {
    this.properties.dataSource = connection
    return this
  }

  /**
   * Sets a validator to be used by application for model and input validation.
   */
  validator(validator: Validator) {
    this.properties.validator = validator
    return this
  }

  /**
   * Sets a logger to be used by application for logging events.
   */
  logger(logger: Logger) {
    this.properties.logger = logger
    return this
  }

  /**
   * Sets an error handler to be used by application for handling errors.
   */
  errorHandler(errorHandler: ErrorHandler) {
    this.properties.errorHandler = errorHandler
    return this
  }

  /**
   * Bootstraps a server.
   */
  async bootstrap(serverImpl: ApplicationServer): Promise<void> {
    await serverImpl(this.options)
  }

  /**
   * Sets context data to be injected into all resolvers.
   */
  context(context: ContextResolver<Context>): this {
    this.properties.context = context
    return this
  }

  /**
   * Returns an action manager for a given defined query.
   */
  action<Key extends keyof Actions>(name: Key): ActionManager<Actions[Key], Context> {
    if (!this.options.actions)
      throw Errors.noActionsDefined()

    let manager = this.properties.actionManagers.find(manager => {
      return manager.name === name
    })
    if (!manager) {
      manager = new ActionManager(this.properties, name as string, this.options.actions[name])
      this.properties.actionManagers.push(manager)
    }
    return manager
  }

  /**
   * Returns a declaration manager for a given defined query.
   */
  query<Key extends keyof Queries>(name: Key): DeclarationManager<Queries[Key], Context> {
    if (!this.options.queries)
      throw Errors.noQueriesDefined()

    let manager = this.properties.declarationManagers.find(manager => {
      return manager.type === "query" && manager.name === name
    })
    if (!manager) {
      manager = new DeclarationManager(this.properties, "query", name as string)
      this.properties.declarationManagers.push(manager)
    }
    return manager
  }

  /**
   * Returns a declaration manager for a given defined mutation.
   */
  mutation<Key extends keyof Mutations>(name: Key): DeclarationManager<Mutations[Key], Context> {
    if (!this.options.mutations)
      throw Errors.noMutationsDefined()

    let manager = this.properties.declarationManagers.find(manager => {
      return manager.type === "mutation" && manager.name === name
    })
    if (!manager) {
      manager = new DeclarationManager(this.properties, "mutation", name as string)
      this.properties.declarationManagers.push(manager)
    }
    return manager
  }

  /**
   * Returns a model manager for a given defined model.
   */
  model<Key extends keyof Models>(name: Key): ModelManager<Models[Key], Context> {
    if (!this.options.models)
      throw Errors.noModelsDefined()

    const model = this.options.models[name]
    let manager = this.properties.modelManagers.find(manager => {
      return manager.name === name
    })
    if (!manager) {
      manager = new ModelManager(this.properties, name as string, model)
      this.properties.modelManagers.push(manager)
    }
    return manager
  }

  /**
   * Returns an input manager for a given defined input.
   */
  input<Key extends keyof Inputs>(name: Key): InputManager<Inputs[Key], Context> {
    if (!this.options.inputs)
      throw Errors.noInputsDefined()

    const input = this.options.inputs[name]
    let manager = this.properties.inputManagers.find(manager => {
      return manager.name === name
    })
    if (!manager) {
      manager = new InputManager(this.properties, name as string, input)
      this.properties.inputManagers.push(manager)
    }
    return manager
  }

  /**
   * Returns an entity builder for a given defined model.
   */
  entity<Key extends keyof Models>(name: Key): ModelEntity<Models[Key]> {
    if (!this.options.models)
      throw Errors.noModelsDefined()

    const model = this.options.models[name]
    let entity = this.properties.entities.find(entity => entity.model === model)
    if (!entity) {
      entity = new ModelEntity(this.properties, model)
      this.properties.entities.push(entity)
    }
    return entity
  }

  /**
   * Returns entity repository for a given defined model.
   */
  repository<ModelName extends keyof Models>(name: ModelName): Repository<ModelType<Models[ModelName]>>

  /**
   * Returns entity repository for a given defined model together with defined custom repository functions.
   */
  repository<ModelName extends keyof Models, CustomRepositoryDefinition>(name: ModelName, customRepository: CustomRepositoryFactory<Repository<ModelType<Models[ModelName]>>, CustomRepositoryDefinition>): Repository<ModelType<Models[ModelName]>> & CustomRepositoryDefinition

  /**
   * Returns entity repository for a given defined model.
   */
  repository<ModelName extends keyof Models>(name: ModelName, customRepository?: CustomRepositoryFactory<any, any>) {
    return new Proxy({} as any, {
      get: (obj, prop) => {
        if (!obj.repository) {
          if (!this.properties.dataSource)
            throw Errors.noDataSourceInApp()

          const ormRepository = this.properties.dataSource.getRepository(name as string)
          if (customRepository) {
            obj.repository = {
              ...ormRepository,
              ...customRepository(ormRepository)
            }
          } else {
            obj.repository = ormRepository
          }
        }

        return obj.repository[prop]
      }
    })
  }

  /**
   * Returns aggregation executor to perform aggregated queries.
   */
  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(this.properties, aggregateOptions)
  }

  /**
   * Checks if model has entity defined.
   */
  hasEntity(model: Model<any> | ModelReference<any> | string): boolean {
    const modelName = typeof model === "string" ? model : model.name
    const entity = this
      .properties
      .entities
      .find(entity => entity.model.name === modelName)
    return !!entity
  }

}
