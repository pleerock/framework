import {AnyBlueprintType, AnyInputType, Blueprint} from "./core";
import {DeclarationArgs, DeclarationList} from "./declarations";
import {BlueprintArgs} from "./operators";
import {ContextList} from "./ApplicationOptions";

/**
 * Defines a resolver schema for the model (based on blueprint) properties.
 *
 * todo: returned value properties must be optional
 */
export type ModelResolverSchema<
  T extends Blueprint,
  Context extends ContextList
> = {
  [P in keyof T]?:
    T[P] extends BlueprintArgs<infer ValueType, infer ArgsType> ?
      | ((parent: AnyBlueprintType<T>, args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context>) => AnyBlueprintType<ValueType>)
      | ((parent: AnyBlueprintType<T>, args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context>) => Promise<AnyBlueprintType<ValueType>>)
      | Promise<AnyBlueprintType<ValueType>>
      | AnyBlueprintType<ValueType>
    :
      | ((parent: AnyBlueprintType<T>, context: AnyBlueprintType<Context>) => AnyBlueprintType<T[P]>)
      | ((parent: AnyBlueprintType<T>, context: AnyBlueprintType<Context>) => Promise<AnyBlueprintType<T[P]>>)
      | Promise<AnyBlueprintType<T[P]>>
      | AnyBlueprintType<T[P]>
}

/**
 * Defines a resolver function for a specific declaration (root query or mutation).
 *
 * todo: returned value properties must be optional
 */
export type DeclarationResolverFn<
  AllDeclarations extends DeclarationList,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList
> =
  AllDeclarations[DeclarationName]["args"] extends DeclarationArgs

    ? (args: AnyInputType<AllDeclarations[DeclarationName]["args"]>, context: AnyBlueprintType<Context>) =>
        | AnyBlueprintType<AllDeclarations[DeclarationName]["return"]>
        | Promise<AnyBlueprintType<AllDeclarations[DeclarationName]["return"]>>

    : (context: AnyBlueprintType<Context>) =>
        | AnyBlueprintType<AllDeclarations[DeclarationName]["return"]>
        | Promise<AnyBlueprintType<AllDeclarations[DeclarationName]["return"]>>


/**
 * Defines a query / mutation / model resolver.
 */
export type Resolver = {

  /**
   * Resolver type.
   */
  type: "query" | "mutation" | "model"

  /**
   * Query or mutation name, or property name in the model.
   */
  name: string

  /**
   * For model resolvers,
   * defines a blueprint resolver schema.
   */
  schema?: ModelResolverSchema<any, any>

  /**
   * For model root queries and mutations,
   * defines a resolver function for them.
   */
  resolverFn?: DeclarationResolverFn<any, any, any>
}

/**
 * Type for context resolver.
 */
export type ContextResolver<Context extends ContextList> = {
  [P in keyof Context]: () => AnyBlueprintType<Context[P]> | Promise<AnyBlueprintType<Context[P]>>
}
