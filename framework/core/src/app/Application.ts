import {ApplicationOptions, ContextList, InputList, ModelList} from "./ApplicationOptions";
import {ApplicationServer} from "./ApplicationServer";
import {DeclarationBlueprint} from "./declarations";
import {AggregateHelper, DeclarationHelper, EntityHelper, InputHelper, ModelHelper} from "./helpers";
import {AggregateOptions} from "./aggregation";
import {ApplicationClient} from "../client";
import {Connection, Repository} from "typeorm";
import {ModelType} from "./core";
import {ContextResolver} from "./resolvers";
import {ApplicationProperties} from "./ApplicationProperties";

export class Application<
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  > {

  properties: ApplicationProperties = {
    dataSource: undefined,
    context: {},
    resolvers: [],
    entities: [],
    modelValidators: [],
    inputValidators: [],
  }

  public readonly options: ApplicationOptions<
    Queries,
    Mutations,
    Models,
    Inputs,
    Context
  >

  constructor(
    options: ApplicationOptions<
      Queries,
      Mutations,
      Models,
      Inputs,
      Context
      >,
  ) {
    this.options = options
  }

  context(context: ContextResolver<Context>): void {
    this.properties.context = context
  }

  query<Key extends keyof Queries>(name: Key): DeclarationHelper<Queries, Key, Context> {
    return new DeclarationHelper(this.properties, "query", name)
  }

  mutation<Key extends keyof Mutations>(name: Key): DeclarationHelper<Mutations, Key, Context> {
    return new DeclarationHelper(this.properties, "mutation", name)
  }

  model<Key extends keyof Models>(name: Key): ModelHelper<Models, Key, Models[Key]["blueprint"], Context> {
    const model = this.options.models[name]
    return new ModelHelper(this.properties, name, model)
  }

  input<Key extends keyof Inputs>(name: Key): InputHelper<Inputs, Key, Inputs[Key]["blueprint"], Context> {
    const input = this.options.inputs[name]
    return new InputHelper(this.properties, name, input)
  }

  entity<Key extends keyof Models>(name: Key): EntityHelper<Models[Key]> {
    const model = this.options.models[name]
    let entity = this.properties.entities.find(entity => entity.model === model)
    if (!entity) {
      entity = new EntityHelper(model)
      this.properties.entities.push(entity)
    }
    return entity
  }

  repository<ModelName extends keyof Models>(name: ModelName): Repository<ModelType<Models[ModelName]>> {
    if (!this.properties.dataSource)
      throw new Error(`No connection has been set`)
    return this.properties.dataSource.getRepository(name as string)
  }

  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(this.properties, aggregateOptions)
  }

  setupClient(client: ApplicationClient) {
    this.properties.client = client
    return this
  }

  dataSource(connection: Connection) {
    this.properties.dataSource = connection
    return this
  }

  async bootstrap(serverImpl: ApplicationServer): Promise<void> {
    await serverImpl(this.options)
  }

}
