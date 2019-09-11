import {ApplicationOptions, ContextList, InputList, ModelList} from "./ApplicationOptions";
import {ApplicationServer} from "./ApplicationServer";
import {DeclarationList} from "./declarations";
import {AggregateHelper, ModelHelper, DeclarationHelper} from "./helpers";
import {AggregateOptions} from "./aggregation";

export class Application<
  Queries extends DeclarationList,
  Mutations extends DeclarationList,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  > {

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
    return new DeclarationHelper("query", name)
  }

  mutation<Key extends keyof Mutations>(name: Key): DeclarationHelper<Mutations, Key, Context> {
    return new DeclarationHelper("mutation", name)
  }

  model<Key extends keyof Models>(name: Key): ModelHelper<Models, Key, Context> {
    return new ModelHelper(name)
  }

  aggregate<T extends AggregateOptions>(aggregateOptions: T): AggregateHelper<T> {
    return new AggregateHelper<T>(aggregateOptions)
  }

  async bootstrap(serverImpl: ApplicationServer): Promise<void> {
    await serverImpl(this.options)
  }

}
