import {DeclarationBlueprint} from "./declarations";
import {
  AnyBlueprint,
  AnyBlueprintSelectionType,
  AnyBlueprintType,
  AnyInputType,
  Blueprint,
  SelectionSchema,
  BlueprintCondition,
  BlueprintOrdering
} from "./core";
import {BlueprintArgs, BlueprintArray, Model, ModelReference} from "./operators";
import {ApplicationClient} from "../client";
import {ContextList, ModelList} from "./ApplicationOptions";
import {DeclarationHelper, ModelHelper} from "./helpers";

// todo: maybe group select functions into single object?

export function select<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList,
  Selection extends DeclarationSelection<AllDeclarations[DeclarationName]>
  >(
    helper: DeclarationHelper<AllDeclarations, DeclarationName, Context>,
    selection: Selection
): DeclarationSelector<AllDeclarations, DeclarationName, Selection> {
  return new DeclarationSelector(
    helper.type,
    helper.name,
    selection,
    helper.client
  )
}

export function selectOne<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>
  >(
    helper: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
    selection: Selection
): ModelSelector<Models, ModelName, ModelBlueprint, Context, Selection, DeclarationSelectorResult<Models, ModelName, Selection>> {
  return new ModelSelector(
    "one",
    "_model_" + helper.name + "_one",
    selection,
    helper.client
  )
}

export function selectMany<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>
  >(
    helper: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
    selection: Selection
): ModelSelector<Models, ModelName, ModelBlueprint, Context, Selection, DeclarationSelectorResult<Models, ModelName, Selection>[]> {
  return new ModelSelector(
    "many",
    "_model_" + helper.name + "_many",
    selection,
    helper.client
  )
}

export function selectCount<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>
  >(
    helper: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
    selection: Selection
) {
  return {
    fetch(): Promise<number> {
      return executeQuery(helper.client, "query", helper.name as string, selection)
        .then(result => result.count)
    }
  }
}

export function saveModel<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>
  >(
    helper: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
    selection: Selection
) {
  return {
    fetch(): Promise<DeclarationSelectorResult<Models, ModelName, Selection>> {
      return executeQuery(helper.client, "mutation", helper.name as string, selection)
    }
  }
}

export function removeModel<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>
>(
    helper: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
    selection: Selection
) {
  return {
    fetch(): Promise<void> {
      return executeQuery(helper.client, "mutation", helper.name as string, selection)
        .then(() => {})
    }
  }
}

/**
 * Selection subset of the particular model / blueprint with args applied if they are defined.
 */
export type DeclarationSelection<T extends AnyBlueprint, EntitySelection extends boolean = false> =
  T extends BlueprintArgs<infer ValueType, infer ArgsType> ?
    {
      select:
        ValueType extends Model<infer B> ? SelectionSchema<B> :
        ValueType extends BlueprintArray<infer I> ?
          I extends Blueprint ? SelectionSchema<I> :
          I extends Model<infer B> ? SelectionSchema<B> :
          never :
        never
      args: AnyInputType<ArgsType>
    } :
  EntitySelection extends true ?
  {
    select:
      T extends Model<infer B> ? SelectionSchema<B> :
      T extends BlueprintArray<infer I> ?
        I extends Blueprint ? SelectionSchema<I> :
        I extends Model<infer B> ? SelectionSchema<B> :
        never :
      never
    args?: 
      T extends Model<infer B> ? { where?: BlueprintCondition<B>, order?: BlueprintOrdering<B> } :
      T extends BlueprintArray<infer I> ?
        I extends Blueprint ? { where?: BlueprintCondition<I>, order?: BlueprintOrdering<I> } :
        I extends Model<infer B> ? { where?: BlueprintCondition<B>, order?: BlueprintOrdering<B> } :
        never :
      never
  } : 
  {
    select:
      T extends Model<infer M> ? SelectionSchema<M> :
      T extends Blueprint ? SelectionSchema<T> :
      T extends BlueprintArray<infer U> ?
        U extends Blueprint ? SelectionSchema<U> :
        U extends Model<infer MM> ? SelectionSchema<MM> :
        never :
      never
  }

/**
 * Defines a type of the selected value.
 */
export type DeclarationSelectorResult<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Selection extends DeclarationSelection<AllDeclarations[DeclarationName], any>
> =
  AllDeclarations[DeclarationName] extends BlueprintArray<infer I> ? AnyBlueprintType<AnyBlueprintSelectionType<I, Selection["select"]>>[] :
  AllDeclarations[DeclarationName] extends BlueprintArgs<infer ValueType, infer ArgsType> ? AnyBlueprintType<AnyBlueprintSelectionType<ValueType, Selection["select"]>> :
  AllDeclarations[DeclarationName] extends Blueprint ? AnyBlueprintType<AnyBlueprintSelectionType<AllDeclarations[DeclarationName], Selection["select"]>> :
  AllDeclarations[DeclarationName] extends Model<infer B> ? AnyBlueprintType<AnyBlueprintSelectionType<B, Selection["select"]>> :
  AllDeclarations[DeclarationName] extends ModelReference<infer M> ? AnyBlueprintType<AnyBlueprintSelectionType<M["blueprint"], Selection["select"]>> :
  never

const transformArgs = (args: any): string => {
  return Object
    .keys(args)
    .map(argsKey => {
      if (args[argsKey] instanceof Object) {
        return `${argsKey}: { ${transformArgs(args[argsKey])} }`
      } else if (typeof args[argsKey] === "string") {
        return `${argsKey}: "${args[argsKey]}"`
      } else {
        return `${argsKey}: ${args[argsKey]}`
      }
    })
    .join(", ")
}

export const SelectToQueryStringTransformer = {
  transform(select: any) {
    let query = `{`
    for (let key in select) {
      if (select[key] === true) {
        query += ` ${key}`
        
      } else if (select[key] instanceof Object) {
        query += ` ${key}`
        if ((select[key] as { args: any }).args) {
          query += `(`
          query += transformArgs((select[key] as { args: any }).args)
          query += ")"
        }
        if ((select[key] as { select: any }).select) {
          query += " " + this.transform(select[key].select) + " "
        }
      }
    }
    query += " }"
    return query
  }
}

// todo: add args
export function executeQuery(
  client: ApplicationClient | undefined,
  type: "query" | "mutation",
  name: string,
  options: any,
  args?: any,
) {

    if (!client)
      throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

    let query = ""
    if (type === "query") {
      query += `query `
    } else if (type === "mutation") {
      query += `mutation `
    }
    // if (args) {
    //   query += `(${JSON.stringify(args)})`
    // }
    query += `{ ${name}`
    if (options.args) {
      query += `(`
      query += transformArgs(options.args)
      query += ")"
    }
    query += " " + SelectToQueryStringTransformer.transform(options.select)
    query += " }"
    console.log("query: ", query)
    return client
      .fetch(JSON.stringify({ query }))
      .then(response => {
        // todo: make this code more elegant
        if (response.errors && response.errors.length) {
          throw new Error(response.errors)
        }
        return response.data[name]
      })
}

/**
 * Operates over selected peace of data.
 */
export class DeclarationSelector<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Selection extends DeclarationSelection<AllDeclarations[DeclarationName]>
> {
  constructor(
    public type: "query" | "mutation",
    private name: DeclarationName,
    private selection: Selection,
    private client: ApplicationClient | undefined,
  ) {
  }

  /**
   * Fetches the selected data.
   */
  async fetch(): Promise<DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>> {
    return executeQuery(this.client, this.type, this.name as string, this.selection)
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>) => any) {
  }

}

/**
 * Operates over selected peace of data.
 */
export class ModelSelector<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList,
  Selection extends DeclarationSelection<Models[ModelName], true>,
  ReturnedType extends unknown
> {
  constructor(
    public type: "one" | "many",
    private name: string,
    private selection: Selection,
    private client: ApplicationClient | undefined,
  ) {
  }

  /**
   * Fetches the selected data.
   */
  fetch(): Promise<ReturnedType> {
    return executeQuery(this.client, "query", this.name as string, this.selection)
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: ReturnedType) => any) {
  }

}
