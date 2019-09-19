import {Connection, Repository} from "typeorm";
import {AggregateHelper, AggregateOptions} from "../aggregate";
import {ApplicationClient} from "../client";
import {ContextResolver} from "../context";
import {ModelEntity} from "../entity";
import {Errors} from "../errors";
import {DeclarationManager, InputManager, ModelManager} from "../manager";
import {Input, InputReference, Model, ModelReference, ModelType} from "../types";
import {Validator} from "../validation";
import {ApplicationOptions} from "./ApplicationOptions";
import {ApplicationProperties} from "./ApplicationProperties";
import {ApplicationServer} from "./ApplicationServer";
import {ContextList, DeclarationBlueprint, InputList, ModelList} from "./ApplicationTypes";
import {DefaultNamingStrategy} from "./DefaultNamingStrategy";

/**
 * Represents any application type.
 */
export type AnyApplication = Application<any, any, any, any, any>

/**
 * Application is a root point of the framework.
 */
export class Application<
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
    context: {},
    entities: [],
    declarationManagers: [],
    modelManagers: [],
    inputManagers: [],
  }

  /**
   * Application options.
   */
  readonly options: ApplicationOptions<
    Queries,
    Mutations,
    Models,
    Inputs,
    Context
  >

  constructor(options: ApplicationOptions<Queries, Mutations, Models, Inputs, Context>) {
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
   * Returns a declaration manager for a given defined query.
   */
  query<Key extends keyof Queries>(name: Key): DeclarationManager<Queries[Key], Context> {
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
    const model = this.options.models[name]
    return new ModelManager(this.properties, name as string, model)
  }

  /**
   * Returns an input manager for a given defined input.
   */
  input<Key extends keyof Inputs>(name: Key): InputManager<Inputs[Key], Context> {
    const input = this.options.inputs[name]
    return new InputManager(this.properties, name as string, input)
  }

  /**
   * Returns an entity builder for a given defined model.
   */
  entity<Key extends keyof Models>(name: Key): ModelEntity<Models[Key]> {
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
  repository<ModelName extends keyof Models>(name: ModelName): Repository<ModelType<Models[ModelName]>> {
    if (!this.properties.dataSource)
      throw Errors.noDataSourceInApp()

    return this.properties.dataSource.getRepository(name as string)
  }

  /**
   * Returns aggregation executor to perform aggregated queries.
   */
  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(this.properties, aggregateOptions)
  }

  /**
   * Returns input manager for a given input or input name.
   * Throws error if given input wasn't registered in the app.
   */
  findInputManager(input: Input<any> | InputReference<any> | string) {
    const inputName = typeof input === "string" ? input : input.name
    const inputManager = this
      .properties
      .inputManagers
      .find(manager => manager.input.name === inputName)
    if (!inputManager)
      throw Errors.inputWasNotFound(inputName)

    return inputManager
  }

  /**
   * Returns model manager for a given model or model name.
   * Throws error if given model wasn't registered in the app.
   */
  findModelManager(model: Model<any> | ModelReference<any> | string) {
    const modelName = typeof model === "string" ? model : model.name
    const modelManager = this
      .properties
      .modelManagers
      .find(manager => manager.model.name === modelName)
    if (!modelManager)
      throw Errors.modelWasNotFound(modelName)

    return modelManager
  }

  /**
   * Returns entity for the given model or model name.
   * Throws error if entity was not found for a given model.
   */
  findEntity(model: Model<any> | ModelReference<any> | string) {
    const modelName = typeof model === "string" ? model : model.name
    const entity = this
      .properties
      .entities
      .find(entity => entity.model.name === modelName)
    if (!entity)
      throw Errors.entityWasNotFound(modelName)

    return entity
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
    return entity !== null
  }

}
