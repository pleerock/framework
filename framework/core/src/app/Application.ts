import {ApplicationOptions, ContextList, InputList, ModelList} from "./ApplicationOptions";
import {ApplicationServer} from "./ApplicationServer";
import {DeclarationBlueprint} from "./declarations";
import {AggregateHelper, ModelHelper, DeclarationHelper} from "./helpers";
import {AggregateOptions} from "./aggregation";
import {ApplicationClient} from "../client";

export class Application<
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  > {

  private client?: ApplicationClient

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

  query<Key extends keyof Queries>(name: Key): DeclarationHelper<Queries, Key, Context> {
    return new DeclarationHelper("query", name, this.client)
  }

  mutation<Key extends keyof Mutations>(name: Key): DeclarationHelper<Mutations, Key, Context> {
    return new DeclarationHelper("mutation", name, this.client)
  }

  model<Key extends keyof Models>(name: Key): ModelHelper<Models, Key, Context> {
    return new ModelHelper(name, this.client)
  }

  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(aggregateOptions, this.client)
  }

  async bootstrap(serverImpl: ApplicationServer): Promise<void> {
    await serverImpl(this.options)
  }

  setupClient(client: ApplicationClient) {
    this.client = client
    return this
  }

}
