import {DeclarationBlueprint} from "./declarations";
import {
  AnyBlueprint,
  AnyBlueprintSelectionType,
  AnyBlueprintType,
  AnyInputType,
  Blueprint,
  SelectionSchema
} from "./core";
import {BlueprintArgs, BlueprintArray, Model, ModelReference} from "./operators";
import {ApplicationClient} from "../client";

/**
 * Selection subset of the particular model / blueprint with args applied if they are defined.
 */
export type DeclarationSelection<T extends AnyBlueprint> =
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
    } : {
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
  Selection extends DeclarationSelection<AllDeclarations[DeclarationName]>
> =
  AllDeclarations[DeclarationName] extends BlueprintArray<infer I> ? AnyBlueprintType<AnyBlueprintSelectionType<I, Selection["select"]>>[] :
  AllDeclarations[DeclarationName] extends BlueprintArgs<infer ValueType, infer ArgsType> ? AnyBlueprintType<AnyBlueprintSelectionType<ValueType, Selection["select"]>> :
  AllDeclarations[DeclarationName] extends Blueprint ? AnyBlueprintType<AnyBlueprintSelectionType<AllDeclarations[DeclarationName], Selection["select"]>> :
  AllDeclarations[DeclarationName] extends Model<infer B> ? AnyBlueprintType<AnyBlueprintSelectionType<B, Selection["select"]>> :
  AllDeclarations[DeclarationName] extends ModelReference<infer M> ? AnyBlueprintType<AnyBlueprintSelectionType<M["blueprint"], Selection["select"]>> :
  never

export const SelectToQueryStringTransformer = {
  transform(select: any) {
    let query = `{`
    for (let key in select) {
      if (select[key] === true) {
        query += ` ${key}`
        
      } else if (select[key] instanceof Object) {
        query += ` ${key}`
        if ((select[key] as { args: any }).args) {
          const args = (select[key] as { args: any }).args
          query += `(`
          query += Object
            .keys(args)
            .map(argsKey => {
              return `${argsKey}: ${args[argsKey]}`
            })
            .join(", ")
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
    private options: Selection,
    private client: ApplicationClient | undefined,
  ) {
  }

  /**
   * Fetches the selected data.
   */
  async fetch(): Promise<{ data: DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>, errors?: any[] }> {
    if (!this.client)
      throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

    let query = ""
    if (this.type === "query") {
      query += "query { "
    } else if (this.type === "mutation") {
      query += "mutation { "
    }
    query += `${this.name} ${SelectToQueryStringTransformer.transform(this.options.select)}`
    query += " }"
    console.log("query: ", query)
    return this.client
      .fetch(JSON.stringify({ query }))
      .then(response => {
        // todo: make this code more elegant
        response["data"] = response.data[this.name]
        return response
      })
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>) => any) {
  }

}
