import {AnyBlueprintType, AnyInputType, Blueprint} from "./core";
import {DeclarationBlueprint} from "./declarations";
import {BlueprintArgs, BlueprintArray, Model, ModelReference} from "./operators";
import {ContextList} from "./ApplicationOptions";
import {Connection} from "typeorm";

export type DefaultContext = {
  connection: Connection
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
