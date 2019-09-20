import {Action, ActionType} from "../app";
import {ApplicationClient} from "../client";
import {
  AnyBlueprint,
  AnyBlueprintSelectionType,
  AnyBlueprintType,
  AnyInputType,
  Blueprint,
  BlueprintCondition,
  BlueprintOrdering,
  SelectionSchema
} from "./core";
import {BlueprintArgs, BlueprintArray, Model, ModelReference} from "./operators";

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
  Declaration extends AnyBlueprint,
  Selection extends DeclarationSelection<Declaration, any>
> =
  Declaration extends BlueprintArray<infer I> ? AnyBlueprintType<AnyBlueprintSelectionType<I, Selection["select"]>>[] :
  Declaration extends BlueprintArgs<infer ValueType, infer ArgsType> ? AnyBlueprintType<AnyBlueprintSelectionType<ValueType, Selection["select"]>> :
  Declaration extends Blueprint ? AnyBlueprintType<AnyBlueprintSelectionType<Declaration, Selection["select"]>> :
  Declaration extends Model<infer B> ? AnyBlueprintType<AnyBlueprintSelectionType<B, Selection["select"]>> :
  Declaration extends ModelReference<infer M> ? AnyBlueprintType<AnyBlueprintSelectionType<M["blueprint"], Selection["select"]>> :
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

export function executeAction(
  client: ApplicationClient | undefined,
  route: string,
  type: string,
  actionValues: ActionType<Action>,
) {
  if (!client)
    throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

  return client.action(route, type, actionValues)
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
      .graphql(JSON.stringify({ query }))
      .then(response => {
        // todo: make this code more elegant
        if (response.errors && response.errors.length) {
          throw new Error(response.errors)
        }
        return response.data[name]
      })
}
