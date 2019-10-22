import {AnyBlueprint, AnyBlueprintType, AnyInputType, AnyRootInput, Blueprint, BlueprintAnyProperty} from "./core";
import {BlueprintArgs, BlueprintArray, BlueprintNullable, Model, ModelReference} from "./operators";
import {Action, ContextList} from "../app";

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

export type ActionResolverFn<
  A extends Action,
  Context extends ContextList
> = (args: {
 params?: A["params"] extends AnyRootInput ? AnyInputType<A["params"]> : never,
 query?: A["query"] extends AnyRootInput ? AnyInputType<A["query"]> : never,
 header?: A["header"] extends AnyRootInput ? AnyInputType<A["header"]> : never,
 cookies?: A["cookies"] extends AnyRootInput ? AnyInputType<A["cookies"]> : never,
 body?: A["body"] extends AnyRootInput ? AnyInputType<A["body"]> : never,
}, context: AnyBlueprintType<Context> & DefaultContext) => AnyBlueprintType<A["return"]>


export type SubscriptionResolverFn<
  Declaration extends AnyBlueprint,
  Context extends ContextList
  > = {
  triggers: string | string[]
  filter?: (payload: any, args: any, context: any) => boolean | Promise<boolean>
}

/**
 * Defines a resolver function for a specific declaration (root query or mutation).
 *
 * todo: returned value properties must be optional
 */
export type DeclarationResolverFn<
  Declaration extends AnyBlueprint,
  Context extends ContextList
> =
  Declaration extends BlueprintArgs<infer ValueType, infer ArgsType> ? (

    ValueType extends BlueprintNullable<infer V> ? (

      V extends BlueprintArray<infer I> ? (

        I extends Model<infer B> ?
          (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
            | AnyBlueprintType<B>[] | null
            | Promise<AnyBlueprintType<B>[] | null> :

        I extends ModelReference<infer M> ?
          (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
            | AnyBlueprintType<M["blueprint"]>[] | null
            | Promise<AnyBlueprintType<M["blueprint"]>[] | null> :

        I extends Blueprint ?
          (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
            | AnyBlueprintType<I>[] | null
            | Promise<AnyBlueprintType<I>[] | null> :

          never
      ) :

      V extends Model<infer B> ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<B> | null
          | Promise<AnyBlueprintType<B> | null> :

      V extends ModelReference<infer M> ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<M["blueprint"]> | null
          | Promise<AnyBlueprintType<M["blueprint"]> | null> :

      V extends Blueprint ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<V>[] | null
          | Promise<AnyBlueprintType<V>[] | null> :

      never
    ) :

    ValueType extends BlueprintArray<infer I> ? (

      I extends Model<infer B> ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<B>[]
          | Promise<AnyBlueprintType<B>[]> :

      I extends ModelReference<infer M> ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<M["blueprint"]>[]
          | Promise<AnyBlueprintType<M["blueprint"]>[]> :

      I extends Blueprint ?
        (args: AnyInputType<ArgsType>, context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<I>[]
          | Promise<AnyBlueprintType<I>[]> :

      never
    ) :

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

  Declaration extends BlueprintNullable<infer V> ? (

    V extends BlueprintArray<infer I> ? (

      I extends Model<infer B> ?
        (context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<B>[] | null
          | Promise<AnyBlueprintType<B>[] | null> :

      I extends ModelReference<infer M> ?
        (context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<M["blueprint"]>[] | null
          | Promise<AnyBlueprintType<M["blueprint"]>[] | null> :

      I extends Blueprint ?
        (context: AnyBlueprintType<Context> & DefaultContext) =>
          | AnyBlueprintType<I>[] | null
          | Promise<AnyBlueprintType<I>[] | null> :

      never
    ) :

    V extends Model<infer B> ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<B> | null
        | Promise<AnyBlueprintType<B> | null> :

    V extends ModelReference<infer M> ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<M["blueprint"]> | null
        | Promise<AnyBlueprintType<M["blueprint"]> | null> :

    V extends Blueprint ?
      (context: AnyBlueprintType<Context> & DefaultContext) =>
        | AnyBlueprintType<V> | null
        | Promise<AnyBlueprintType<V> | null> :

    never
  ) :

  Declaration extends BlueprintArray<infer I> ? (

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

  Declaration extends Model<infer B> ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<B>
      | Promise<AnyBlueprintType<B>> :

  Declaration extends ModelReference<infer M> ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<M["blueprint"]>
      | Promise<AnyBlueprintType<M["blueprint"]>> :

  Declaration extends Blueprint ?
    (context: AnyBlueprintType<Context> & DefaultContext) =>
      | AnyBlueprintType<Declaration>
      | Promise<AnyBlueprintType<Declaration>> :

  never

/**
 * Defines a query / mutation / model resolver.
 */
export class Resolver {

  /**
   * Resolver type.
   */
  type: "query" | "mutation" | "model" | "action" | "subscription"

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
  resolverFn?: DeclarationResolverFn<any, any> | ActionResolverFn<any, any> | SubscriptionResolverFn<any, any>

  constructor(options: Resolver) {
    this.type = options.type
    this.name = options.name
    this.schema = options.schema
    this.dataLoaderSchema = options.dataLoaderSchema
    this.resolverFn = options.resolverFn
  }

}

// todo: request doesn't have a type here, maybe its time to more resolver stuff to the server?
// todo: create a helper createContext function for users to create contexts easily? 
