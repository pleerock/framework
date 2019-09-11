import {DeclarationList} from "./declarations";
import {ContextList, ModelList} from "./ApplicationOptions";
import {DeclarationResolverFn, ModelResolverSchema, Resolver} from "./resolvers";
import {DeclarationSelection, DeclarationSelector} from "./selection";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";

/**
 * Declarations (root queries and mutations) helper -
 * allows to define a resolver for them or select data from the client.
 */
export class DeclarationHelper<
  AllDeclarations extends DeclarationList,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList
> {
  
  constructor(
    public type: "query" | "mutation",
    private name: DeclarationName
  ) {
  }
  
  resolve(fn: DeclarationResolverFn<AllDeclarations, DeclarationName, Context>): Resolver {
    return {
      type: this.type,
      name: this.name as string,
      resolverFn: fn as any
    }
  }

  select<Selection extends DeclarationSelection<
    AllDeclarations[DeclarationName]["return"],
    AllDeclarations[DeclarationName]["args"]
    >
  >(options: Selection): DeclarationSelector<AllDeclarations, DeclarationName, Selection> {
    return new DeclarationSelector(this.name, options)
  }
}

/**
 * Models helper - allows to define resolver for them or select data from the client.
 */
export class ModelHelper<
  Models extends ModelList,
  ModelName extends keyof Models,
  Context extends ContextList
  > {

  constructor(private name: ModelName) {
  }

  resolve(schema: ModelResolverSchema<Models[ModelName]["blueprint"], Context>): Resolver {
    return {
      type: "model",
      name: this.name as string,
      schema
    }
  }

  // todo: probably to be able to implement data loader we need to create a separate resolveWithDataLoader method
  // todo: implement model selections? YES!
}

/**
 * Aggregations helper - allows to select aggregations from the client.
 */
export class AggregateHelper<T extends AggregateOptions> {
  constructor(private options: T) {
  }

  fetch(): Promise<AggregateOptionsType<T>> {
    return Promise.resolve() as any
  }
}
