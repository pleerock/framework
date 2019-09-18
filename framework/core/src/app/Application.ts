import {Connection, Repository} from "typeorm";
import {AggregateHelper} from "../aggregate";
import {ApplicationClient} from "../client";
import {ContextResolver} from "../context";
import {ModelEntity} from "../entity";
import {Errors} from "../errors";
import {DeclarationManager, InputManager, ModelManager} from "../manager";
import {
  ModelType
} from "../types";
import {AggregateOptions} from "../aggregate/aggregation";
import {ApplicationOptions} from "./ApplicationOptions";
import {ApplicationProperties} from "./ApplicationProperties";
import {ApplicationServer} from "./ApplicationServer";
import {ContextList, DeclarationBlueprint, InputList, ModelList} from "./ApplicationTypes";

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
      throw Errors.noDataSourceInApp

    return this.properties.dataSource.getRepository(name as string)
  }

  /**
   * Returns aggregation executor to perform aggregated queries.
   */
  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(this.properties, aggregateOptions)
  }

}
