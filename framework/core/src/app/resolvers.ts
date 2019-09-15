import {AnyBlueprintType, AnyInputType, Blueprint} from "./core";
import {DeclarationBlueprint} from "./declarations";
import {BlueprintArgs, BlueprintArray, Model, ModelReference} from "./operators";
import {ContextList, ModelList} from "./ApplicationOptions";
import {DeclarationHelper, ModelHelper} from "./helpers";

export function resolve<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList,
>(
  declaration: DeclarationHelper<AllDeclarations, DeclarationName, Context>,
  resolver: DeclarationResolverFn<AllDeclarations, DeclarationName, Context>
): Resolver

export function resolve<
  Models extends ModelList,
  ModelName extends keyof Models,
  ModelBlueprint extends Blueprint,
  Context extends ContextList
>(
  model: ModelHelper<Models, ModelName, ModelBlueprint, Context>,
  schema: ModelResolverSchema<ModelBlueprint, Context>,
  dataLoaderSchema?: ModelDataLoaderResolverSchema<ModelBlueprint, Context>,
): Resolver

export function resolve(helper: any, resolver: any, dataLoaderSchema?: any): Resolver {
  if (helper instanceof ModelHelper) {
    return {
      type: "model",
      name: helper.name as string,
      schema: resolver,
      dataLoaderSchema: dataLoaderSchema,
    }

  } else if (helper instanceof DeclarationHelper) {
    return {
      type: helper.type,
      name: helper.name as string,
      resolverFn: resolver
    }
  }

  throw new Error(`Cannot resolve given object`)
}

/**
 * Default framework properties applied to the user context.
 */
export type DefaultContext = {
}

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
      | ((parent: AnyBlueprintType<T>, args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) => AnyBlueprintType<ValueType>)
      | ((parent: AnyBlueprintType<T>, args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) => Promise<AnyBlueprintType<ValueType>>)
      | Promise<AnyBlueprintType<ValueType>>
      | AnyBlueprintType<ValueType>
    :
      | ((parent: AnyBlueprintType<T>, context: AnyBlueprintType<Context> & DefaultContext) => AnyBlueprintType<T[P]>)
      | ((parent: AnyBlueprintType<T>, context: AnyBlueprintType<Context> & DefaultContext) => Promise<AnyBlueprintType<T[P]>>)
      | Promise<AnyBlueprintType<T[P]>>
      | AnyBlueprintType<T[P]>
}

/**
 * Defines a resolver schema for the model (based on blueprint) properties that uses data loader.
 *
 * todo: returned value properties must be optional
 */
export type ModelDataLoaderResolverSchema<
  T extends Blueprint,
  Context extends ContextList
> = {
  [P in keyof T]?:
    T[P] extends BlueprintArgs<infer ValueType, infer ArgsType> ?
      | ((parent: AnyBlueprintType<T>[], args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) => AnyBlueprintType<ValueType>[])
      | ((parent: AnyBlueprintType<T>[], args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) => Promise<AnyBlueprintType<ValueType>[]>)
      | Promise<AnyBlueprintType<ValueType>[]>
      | AnyBlueprintType<ValueType>[]
    :
      | ((parent: AnyBlueprintType<T>[], context: AnyBlueprintType<Context> & DefaultContext) => AnyBlueprintType<T[P]>[])
      | ((parent: AnyBlueprintType<T>[], context: AnyBlueprintType<Context> & DefaultContext) => Promise<AnyBlueprintType<T[P]>[]>)
      | Promise<AnyBlueprintType<T[P]>[]>
      | AnyBlueprintType<T[P]>[]
}

/**
 * Defines a resolver function for a specific declaration (root query or mutation).
 *
 * todo: returned value properties must be optional
 */
export type DeclarationResolverFn<
  AllDeclarations extends DeclarationBlueprint,
  DeclarationName extends keyof AllDeclarations,
  Context extends ContextList
> =
  AllDeclarations[DeclarationName] extends BlueprintArgs<infer ValueType, infer ArgsType> ? (

    ValueType extends Model<infer B> ?
      (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<B>
        | Promise<AnyBlueprintType<B>> :

    ValueType extends ModelReference<infer M> ?
      (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<M["blueprint"]>
        | Promise<AnyBlueprintType<M["blueprint"]>> :

    ValueType extends Blueprint ?
      (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<ValueType>
        | Promise<AnyBlueprintType<ValueType>> :

    never
  ) :

  AllDeclarations[DeclarationName] extends BlueprintArray<infer I> ? (

    I extends Model<infer B> ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<B>[]
        | Promise<AnyBlueprintType<B>[]> :

    I extends ModelReference<infer M> ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<M["blueprint"]>[]
        | Promise<AnyBlueprintType<M["blueprint"]>[]> :

    I extends Blueprint ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<I>[]
        | Promise<AnyBlueprintType<I>[]> :

    never
  ) :

  AllDeclarations[DeclarationName] extends Model<infer B> ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<B>
      | Promise<AnyBlueprintType<B>> :

  AllDeclarations[DeclarationName] extends ModelReference<infer M> ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<M["blueprint"]>
      | Promise<AnyBlueprintType<M["blueprint"]>> :

  AllDeclarations[DeclarationName] extends Blueprint ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<AllDeclarations[DeclarationName]>
      | Promise<AnyBlueprintType<AllDeclarations[DeclarationName]>> :

  never

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
   * For model resolvers,
   * defines a blueprint resolver schema
   * (data loader version of schema).
   */
  dataLoaderSchema?: ModelDataLoaderResolverSchema<any, any>

  /**
   * For model root queries and mutations,
   * defines a resolver function for them.
   */
  resolverFn?: DeclarationResolverFn<any, any, any>
}

/**
 * Type for context resolver.
 *
 * todo: add request/response parameters
 */
export type ContextResolver<Context extends ContextList> = {
  [P in keyof Context]: () => AnyBlueprintType<Context[P]> | Promise<AnyBlueprintType<Context[P]>>
}
