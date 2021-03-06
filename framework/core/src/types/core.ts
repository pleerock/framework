import {
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable,
  BlueprintSelection,
  FloatConstructor,
  Input,
  InputReference,
  Model,
  ModelReference,
} from "../types";

/**
 * Represents primitive blueprint property type.
 *
 * example: { name: String }, { age: Number }, { expired: Boolean }
 */
export type BlueprintPrimitiveProperty =
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | FloatConstructor

/**
 * Represents any property type blueprint can have.
 *
 * BlueprintPrimitiveProperty:
 *    Primitive blueprint property type.
 *
 *    example: { name: String }, { age: Number }, { active: Boolean }
 *
 * BlueprintNullable:
 *    Marks given property as nullable property in this model.
 *    Properties marked as nullable supposed to be a nullish value.
 *
 *    example: { name: nullable(String) }
 *
 * BlueprintArgs:
 *    Specifies what arguments model property accepts for resolving.
 *
 *    example: { name: args(String, { keyword: String }) }
 *
 * BlueprintArray:
 *    Marks given property as an array.
 *
 *    example: { names: array(String) }
 *
 * Blueprint:
 *    Another blueprint definition right in place.
 *    Useful when there is no need to define a separate model for the nested object
 *    and model / domain logic is relatively simple.
 *
 *    example: { person: { name: String, age: Number, active: Boolean } }
 *
 * Model:
 *    Reference to the model with its own blueprint.
 *    Used when you need to reference some other model as this model property.
 *
 *    example: { person: PersonModel }
 *
 * ModelReference:
 *    Reference to the model reference (ModelReference),
 *    used in the complex scenarios when models can't be used because of circular reference issues.
 *    Referencing works by specifying a model name instead of actual constant reference.
 *
 *    example: { person: reference("Person") }
 *
 * todo: think if we really need BlueprintSelection, and if yes, add docs for it
 */
export type BlueprintAnyProperty =
    | BlueprintPrimitiveProperty
    | BlueprintNullable<any>
    | BlueprintSelection<any, any>
    | BlueprintArgs<any, any>
    | BlueprintArray<any>
    | Blueprint
    | Model<any>
    | ModelReference<any>

export type InputAnyProperty =
  | BlueprintArray<BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>
  | InputReference<any>
  | Input<any>
  | InputBlueprint

/**
 * Blueprint is a schema of your model.
 */
export type Blueprint = {
    [propertyName: string]: BlueprintAnyProperty
};

/**
 * Input blueprint is a schema of your input.
 */
export type InputBlueprint = {
    [propertyName: string]:
      | BlueprintPrimitiveProperty
      | InputBlueprint
      | Input<any>
      | InputReference<any>
      | BlueprintArray<BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>
      | BlueprintNullable<BlueprintPrimitiveProperty | InputBlueprint | InputReference<any> | Input<any> | BlueprintArray<BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>>
};


/**
 * Determines type of the property
 *
 * "P"  - blueprint's property
 * "S"  - selection schema to be used
 * "B"  - blueprint
 * "SS" - selection sub-schema
 * "M"  - model
 * "I"  - array item
 * "V"  - value type
 * "A"  - args type
 *
 * todo: what about Date and Buffer? (think we shall only support JSON types)
 * todo: we might add ability to create custom types and refer them here somehow
 * todo: e.g. ({ createDate: DateType } where DateType extends some class that is checks below)
 * todo: think if we can add P extends Array<infer U> ? U for literal values / enums
 */
export type BlueprintPropertyType<P extends BlueprintAnyProperty | InputAnyProperty, S extends SelectionSchema<any> | undefined = undefined> =
    P extends StringConstructor ? string :
    P extends NumberConstructor ? number :
    P extends FloatConstructor ? number :
    P extends BooleanConstructor ? boolean :
    P extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS> :
    P extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S> :
    P extends Model<infer B> ? BlueprintType<B, S> :
    P extends InputReference<infer I> ? AnyInputType<I["blueprint"]> :
    P extends Input<infer B> ? AnyInputType<B> :
    
    P extends BlueprintNullable<infer V> ? (
        V extends BlueprintArray<infer I> ? (
          I extends StringConstructor ? string[] | null :
          I extends NumberConstructor ? number[] | null :
          I extends FloatConstructor ? number[] | null :
          I extends BooleanConstructor ? boolean[] | null :
          I extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS>[] | null :
          I extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S>[] | null :
          I extends Model<infer B> ? BlueprintType<B, S>[] | null :
          I extends Blueprint ? BlueprintType<I, S>[] | null :
          unknown
        ) :
        V extends StringConstructor ? string | null :
        V extends NumberConstructor ? number | null :
        V extends FloatConstructor ? number | null :
        V extends BooleanConstructor ? boolean | null :
        V extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS> | null :
        V extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S> | null :
        V extends Model<infer B> ? BlueprintType<B, S> | null :
        V extends Blueprint ? BlueprintType<V, S> | null :
        unknown
    ) :
    P extends BlueprintArray<infer I> ? (
        I extends StringConstructor ? string[] :
        I extends NumberConstructor ? number[] :
        I extends FloatConstructor ? number[] :
        I extends BooleanConstructor ? boolean[] :
        I extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS>[] :
        I extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S>[] :
        I extends Model<infer B> ? BlueprintType<B, S>[] :
        I extends Blueprint ? BlueprintType<I, S>[] :
        unknown
    ) :
    P extends BlueprintArgs<infer V, infer A> ? (
        V extends StringConstructor ? string :
        V extends NumberConstructor ? number :
        V extends FloatConstructor ? number :
        V extends BooleanConstructor ? boolean :
        V extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS> :
        V extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S> :
        V extends Model<infer B> ? BlueprintType<B, S> :
        V extends BlueprintNullable<infer VV> ? (
          VV extends StringConstructor ? string[] | null :
          VV extends NumberConstructor ? number[] | null :
          VV extends FloatConstructor ? number[] | null :
          VV extends BooleanConstructor ? boolean[] | null :
          VV extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS>[] | null :
          VV extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S>[] | null :
          VV extends Model<infer B> ? BlueprintType<B, S>[] | null :
          VV extends Blueprint ? BlueprintType<VV, S>[] | null :
          VV extends BlueprintArray<infer I> ? (
            I extends StringConstructor ? string[] | null :
            I extends NumberConstructor ? number[] | null :
            I extends FloatConstructor ? number[] | null :
            I extends BooleanConstructor ? boolean[] | null :
            I extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS>[] | null :
            I extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S>[] | null :
            I extends Model<infer B> ? BlueprintType<B, S>[] | null :
            I extends Blueprint ? BlueprintType<I, S>[] | null :
            unknown
          ) :
          unknown
        ) :
        V extends BlueprintArray<infer I> ? (
            I extends StringConstructor ? string[] :
            I extends NumberConstructor ? number[] :
            I extends FloatConstructor ? number[] :
            I extends BooleanConstructor ? boolean[] :
            I extends BlueprintSelection<infer B, infer SS> ? BlueprintType<B, SS>[] :
            I extends ModelReference<infer M> ? BlueprintType<M["blueprint"], S>[] :
            I extends Model<infer B> ? BlueprintType<B, S>[] :
            I extends Blueprint ? BlueprintType<I, S>[] :
            unknown
        ) :
        V extends Blueprint ? BlueprintType<V, S> :
        unknown
    ) :
    P extends Blueprint ? BlueprintType<P, S> :
    P extends InputBlueprint ? AnyInputType<P> :
    unknown

/**
 * Returns all properties for selection from a given selection object.
 */
type SelectionSelectedKeys<S extends SelectionSchema<any>> = { [P in keyof S]: S[P] extends false ? never : P }[keyof S]

/**
 * Returns all selected keys in the blueprint based on a given selection object.
 */
type BlueprintSelectedKeys<B extends Blueprint, S> = Pick<B, { [P in keyof B]: P extends SelectionSelectedKeys<S> ? P : never }[keyof B]>

/**
 * Returns all optional keys in the blueprint.
 */
type BlueprintNullableKeys<B extends Blueprint> = Pick<B, { [P in keyof B]: B[P] extends BlueprintNullable<any> ? P : never }[keyof B]>

/**
 * Returns all non optional keys in the blueprint.
 */
type BlueprintRequiredKeys<B extends Blueprint> = Pick<B, { [P in keyof B]: B[P] extends BlueprintNullable<any> ? never : P }[keyof B]>

/**
 * Represents alias map in the selection object.
 *
 * example:
 *      {
 *          id: true,
 *          photos: {
 *              myPhotos: {
 *                  name: "photos",
 *                  args: { filter: "my" }
 *              },
 *              friendsPhotos: {
 *                  name: "photos",
 *                  args: { filter: "friends" }
 *              },
 *          }
 *      }
 *
 *      This example would select object with { id, myPhotos, friendsPhotos }.
 *      In this example T is user blueprint and P is "photos" property inside it.
 *
 */
export type SelectionAliasMap<T extends Blueprint, P extends keyof T> = {
    [key: string]:
        T[P] extends BlueprintPrimitiveProperty ? { name: P } :
        T[P] extends Blueprint ? { name: P, select: BlueprintSelectionWithAliases<T[P]> } :
        T[P] extends ModelReference<infer M> ? { name: P, select: BlueprintSelectionWithAliases<M["blueprint"]> } :
        T[P] extends Model<infer B> ? { name: P, select: BlueprintSelectionWithAliases<B> } :
        T[P] extends BlueprintArray<infer I> ? (
            I extends ModelReference<infer M> ? { name: P, select: BlueprintSelectionWithAliases<M["blueprint"]> } :
            I extends Model<infer BB> ? { name: P, select: BlueprintSelectionWithAliases<BB> } :
            I extends Blueprint ? { name: P, select: BlueprintSelectionWithAliases<I> } :
            { name: P }
        ) :
        T[P] extends BlueprintNullable<infer V> ? (
            V extends ModelReference<infer M> ? { name: P, select: BlueprintSelectionWithAliases<M["blueprint"]> } :
            V extends Model<infer BB> ? { name: P, select: BlueprintSelectionWithAliases<BB> } :
            V extends Blueprint ? { name: P, select: BlueprintSelectionWithAliases<V> } :
            V extends BlueprintArray<infer I> ? (
              I extends ModelReference<infer M> ? { name: P, select: BlueprintSelectionWithAliases<M["blueprint"]> } :
              I extends Model<infer BB> ? { name: P, select: BlueprintSelectionWithAliases<BB> } :
              I extends Blueprint ? { name: P, select: BlueprintSelectionWithAliases<I> } :
              { name: P }
            ) :
            { name: P }
        ) :
        T[P] extends BlueprintArgs<infer V, infer A> ? (
            V extends ModelReference<infer M> ? { name: P, select: BlueprintSelectionWithAliases<M["blueprint"]> } :
            V extends Model<infer BB> ? { name: P, select: BlueprintSelectionWithAliases<BB> } :
            V extends Blueprint ? { name: P, select: BlueprintSelectionWithAliases<V> } :
            { name: P }
        ) :
        { name: P }
}

/**
 * Returns selected blueprint properties and their types based on a given selection alias map.
 *
 * example:
 *  BlueprintAliasesType<
 *      { id: Number, name: args(String, { type: String }), album: { id: Number, name: String } }
 *      { { myAlbum: { name: "album", select: { name: true }}, fullName: { name: "name", args: { type: "full" }} }
 *  >
 *
 *  will return { myAlbum: { name: String }, fullName: String }
 *
 * "B"  - blueprint
 * "S"  - selection alias map (e.g. { x1: { name: "propertyName", select: { ... }, args: { ... }}, x2: { name: "propertyName", select: { ... }, args: { ... }} })
 * "BB" - model's blueprint
 * "S[P]" - item from the selection alias map (e.g. x1 and x2)
 * "S[P]["name"]" - propertyName from items x1 and x2
 * "B[S[P]["name"]]" - blueprint property value
 */
type BlueprintAliasesType<B extends Blueprint, S extends SelectionAliasMap<B, keyof B>> = {
    [P in keyof S]:
        B[S[P]["name"]] extends Blueprint ? BlueprintPropertyType<B[S[P]["name"]], S[P]> :
        B[S[P]["name"]] extends BlueprintArgs<infer V, infer A> ? BlueprintPropertyType<V, S[P]> :
        B[S[P]["name"]] extends Model<infer BB> ? BlueprintPropertyType<BB, S[P]> :
        B[S[P]["name"]] extends ModelReference<infer M> ? BlueprintPropertyType<M["blueprint"], S[P]> :
        B[S[P]["name"]] extends BlueprintArray<infer I> ? (
            I extends Blueprint ? BlueprintPropertyType<I, S[P]> :
            I extends BlueprintArgs<infer V, infer A> ? BlueprintPropertyType<V, S[P]> :
            I extends Model<infer BB> ? BlueprintPropertyType<BB, S[P]> :
            I extends ModelReference<infer M> ? BlueprintPropertyType<M["blueprint"], S[P]> :
            unknown
        ) :
        unknown
}

/**
 * Returns type of the blueprint.
 * Filters properties based on a given selection schema.
 *
 * "B"  - blueprint
 * "S"  - selection schema
 */
type BlueprintTypeBase<T extends Blueprint, S extends SelectionSchema<any> | undefined = undefined> =
    S extends undefined ? (
        { [P in keyof T]: T[P] extends BlueprintNullable<infer V> ? BlueprintPropertyType<V> | null : BlueprintPropertyType<T[P]> }
    ) : (
        { [P in keyof BlueprintSelectedKeys<T, S>]: T[P] extends BlueprintNullable<infer V> ? BlueprintPropertyType<V, S[P]> | null : BlueprintPropertyType<T[P], S[P]>  }
    )

// this one is older version based on undefined
// type BlueprintTypeBase<T extends Blueprint, S extends SelectionSchema<any> | undefined = undefined> =
//     S extends undefined ? (
//         { [P in keyof BlueprintRequiredKeys<T>]: T[P] extends BlueprintNullable<any> ? never : BlueprintPropertyType<T[P]> }
//         & { [P in keyof BlueprintNullableKeys<T>]?: T[P] extends BlueprintNullable<infer U> ? BlueprintPropertyType<U> : never }
//     ) : (
//           { [P in keyof BlueprintSelectedKeys<BlueprintRequiredKeys<T>, S>]: T[P] extends BlueprintNullable<any> ? never : BlueprintPropertyType<T[P], S[P]>  }
//         & { [P in keyof BlueprintSelectedKeys<BlueprintNullableKeys<T>, S>]?: T[P] extends BlueprintNullable<infer U> ? BlueprintPropertyType<U, S[P]> : never }
//     )

/**
 * Returns type of the blueprint.
 * Filters properties based on a given selection schema.
 * Takes care on a complex selection cases involving args and aliases.
 *
 * example:
 *      type PersonBlueprint = BlueprintType<{ id: NumberConstructor, name: StringConstructor }>
 *      will return { id: number, name: string }
 *
 *      type PersonBlueprint = BlueprintType<{ id: NumberConstructor, name: StringConstructor }, { id: true}>
 *      will return { id: number }
 *
 * "B"  - blueprint
 * "S"  - selection schema
 */
export type BlueprintType<T extends Blueprint, S extends SelectionSchema<T> | undefined = undefined> =
    S extends { args: infer Args, select: infer Selection, aliases: SelectionAliasMap<T, keyof T> } ? (
        BlueprintTypeBase<T, Selection> & BlueprintAliasesType<T, S["aliases"]>
    ) :
    S extends { select: infer Selection, aliases: SelectionAliasMap<T, keyof T> } ? (
        BlueprintTypeBase<T, Selection> & BlueprintAliasesType<T, S["aliases"]>
    ) :
    S extends { args: infer Args, select: infer Selection } ? (
        BlueprintTypeBase<T, Selection>
    ) :
    S extends { args: infer Args } ? (
        BlueprintTypeBase<T, S> // todo: "S" or undefined?
    ) :
    S extends { select: infer Selection } ? (
        BlueprintTypeBase<T, Selection>
    ) :
    S extends { aliases: SelectionAliasMap<T, keyof T> } ? (
        BlueprintAliasesType<T, S["aliases"]>
    ) :
        BlueprintTypeBase<T, S> // todo: "S" or undefined?

/**
 * Part of selection schema, used in selection schema for nested blueprints in blueprint.
 * Allows specifying properties for selection together with aliases.
 */
export type BlueprintSelectionWithAliases<T extends Blueprint> =
{
    select: SelectionSchema<T>
    aliases: SelectionAliasMap<T, keyof T>
} | {
    select: SelectionSchema<T>
} | {
    aliases: SelectionAliasMap<T, keyof T>
}

/**
 * Selection schema indicates what properties of the blueprint model must be selected.
 *
 * example:
 *  const onlyIdAndName: SelectionSchema<{ id: Number, name: String, age: Number }> = { id: true, name: true }
 */
export type SelectionSchema<B extends Blueprint> = {
    [P in keyof B]?: // todo add BlueprintNullable
        B[P] extends BlueprintPrimitiveProperty ? boolean | { aliases: SelectionAliasMap<B, keyof B> } :
        B[P] extends Blueprint ? SelectionSchema<B[P]> | BlueprintSelectionWithAliases<B[P]> :
        B[P] extends ModelReference<infer M> ? SelectionSchema<M["blueprint"]> | BlueprintSelectionWithAliases<M["blueprint"]> :
        B[P] extends Model<infer BB> ? SelectionSchema<BB> | BlueprintSelectionWithAliases<BB> :
        B[P] extends BlueprintArray<infer I> ? (
            I extends ModelReference<infer M> ? SelectionSchema<M["blueprint"]> | BlueprintSelectionWithAliases<M["blueprint"]> :
            I extends Model<infer B> ? SelectionSchema<B> | BlueprintSelectionWithAliases<B> :
            I extends Blueprint ? SelectionSchema<I> | BlueprintSelectionWithAliases<I> :
            unknown
        ) :
        B[P] extends BlueprintArgs<infer V, infer A> ? (
            {
                args: AnyInputType<A>,
                select?:
                    V extends ModelReference<infer B> ? SelectionSchema<B["blueprint"]> | BlueprintSelectionWithAliases<B["blueprint"]> :
                    V extends Model<infer M> ? SelectionSchema<M> | BlueprintSelectionWithAliases<M> :
                    V extends Blueprint ? SelectionSchema<V> | BlueprintSelectionWithAliases<V> :
                    V extends BlueprintArray<infer I> ? (
                        I extends ModelReference<infer B> ? SelectionSchema<B["blueprint"]> | BlueprintSelectionWithAliases<B["blueprint"]> :
                        I extends Model<infer M> ? SelectionSchema<M> | BlueprintSelectionWithAliases<M> :
                        I extends Blueprint ? SelectionSchema<I> | BlueprintSelectionWithAliases<I> :
                        unknown
                    ) :
                    unknown
                aliases?:
                    V extends ModelReference<infer M> ? SelectionSchema<M["blueprint"]> | SelectionAliasMap<M["blueprint"], keyof M["blueprint"]> :
                    V extends Model<infer BB> ? SelectionSchema<BB> | SelectionAliasMap<BB, keyof BB> :
                    V extends Blueprint ? SelectionSchema<V> | SelectionAliasMap<V, keyof V> :
                    V extends BlueprintArray<infer I> ? (
                        I extends ModelReference<infer M> ? SelectionSchema<M["blueprint"]> | SelectionAliasMap<M["blueprint"], keyof M["blueprint"]> :
                        I extends Model<infer BB> ? SelectionSchema<BB> | SelectionAliasMap<BB, keyof BB> :
                        I extends Blueprint ? SelectionSchema<I> | SelectionAliasMap<I, keyof I> :
                        unknown
                    ) :
                    unknown
            }
        ) :
        unknown
}


/**
 * Returns type of the model.
 * Useful to extract types out of models when it's not possible to rely just on type inference.
 *
 * example:
 *      type Person = ModelType<typeof PersonModel>
 */
export type ModelType<T extends Model<any>> = BlueprintType<T["blueprint"]>


export type AnyBlueprint =
    | BlueprintPrimitiveProperty
    | Blueprint
    | BlueprintArray<any>
    | BlueprintNullable<BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any> | BlueprintSelection<any, any>>
    | BlueprintSelection<any, any>
    | BlueprintArgs<any, any>
    | Model<any>
    | ModelReference<any>

export type AnyInput =
  | InputBlueprint
  | Input<any>
  | InputReference<any>
  | BlueprintArray<BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>
  | BlueprintNullable<BlueprintPrimitiveProperty | InputBlueprint | InputReference<any> | Input<any> | BlueprintArray<BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>>

export type AnyRootInput =
  | InputBlueprint
  | Input<any>
  | InputReference<any>

export type AnyBlueprintType<T extends AnyBlueprint> =
    T extends BlueprintNullable<infer V> ? (
        V extends BlueprintPrimitiveProperty ? BlueprintPropertyType<V> | null :
        V extends BlueprintArray<any> ? BlueprintPropertyType<V> | null :
        V extends Model<any> ? BlueprintPropertyType<V> | null :
        V extends BlueprintSelection<any, any> ? BlueprintPropertyType<V> | null :
        unknown
    ) :
    BlueprintPropertyType<T>

export type AnyInputPropertyType<P extends AnyInput | BlueprintPrimitiveProperty > =
  P extends StringConstructor ? string :
  P extends NumberConstructor ? number :
  P extends FloatConstructor ? number :
  P extends BooleanConstructor ? boolean :
  P extends InputReference<infer I> ? AnyInputType<I["blueprint"]> :
  P extends Input<infer B> ? AnyInputType<B> :
  P extends InputBlueprint ? AnyInputType<P> :
  P extends BlueprintNullable<infer N> ? (
    N extends StringConstructor ? string | null :
    N extends NumberConstructor ? number | null :
    N extends FloatConstructor ? number | null :
    N extends BooleanConstructor ? boolean | null :
    N extends InputReference<infer I> ? AnyInputType<I["blueprint"]> | null :
    N extends Input<infer B> ? AnyInputType<B> | null :
    N extends InputBlueprint ? AnyInputType<N> | null :
    N extends BlueprintArray<infer I> ? (
      I extends StringConstructor ? string[] | null :
      I extends NumberConstructor ? number[] | null :
      I extends FloatConstructor ? number[] | null :
      I extends BooleanConstructor ? boolean[] | null :
      I extends InputReference<infer II> ? AnyInputType<II["blueprint"]>[] | null :
      I extends Input<infer B> ? AnyInputType<B>[] | null :
      I extends InputBlueprint ? AnyInputType<I>[] | null :
      unknown
    ) :
    unknown
  ) :
  P extends BlueprintArray<infer I> ? (
    I extends StringConstructor ? string[] :
    I extends NumberConstructor ? number[] :
    I extends FloatConstructor ? number[] :
    I extends BooleanConstructor ? boolean[] :
    I extends InputReference<infer II> ? AnyInputType<II["blueprint"]>[] :
    I extends Input<infer B> ? AnyInputType<B>[] :
    I extends InputBlueprint ? AnyInputType<I>[] :
    unknown
  ) :
  unknown

export type AnyInputType<T extends AnyRootInput> =
  T extends BlueprintNullable<infer V> ? (
    V extends Input<infer B> ? { [P in keyof B]: AnyInputPropertyType<B[P]> | null } :
    V extends InputReference<infer I> ? { [P in keyof I["blueprint"]]: AnyInputPropertyType<I["blueprint"][P]> | null } :
    V extends InputBlueprint ? { [P in keyof V]: AnyInputPropertyType<V[P]> | null } :
    unknown
  ) :
  T extends Input<infer B> ? { [P in keyof B]: AnyInputPropertyType<B[P]> } :
  T extends InputReference<infer I> ? { [P in keyof I["blueprint"]]: AnyInputPropertyType<I["blueprint"][P]> } :
  T extends InputBlueprint ? { [P in keyof T]: AnyInputPropertyType<T[P]> } :
  unknown

export type AnyBlueprintSelectionType<T extends AnyBlueprint, S extends SelectionSchema<any>> =
    T extends BlueprintNullable<infer V> ? (
        V extends BlueprintArray<infer U> ? (
            U extends Blueprint ? BlueprintSelection<U, S> :
            U extends Model<infer M> ? BlueprintSelection<M, S> :
            never
        ) :
        V extends Model<infer M> ? BlueprintSelection<M, S> :
        V extends Blueprint ? BlueprintSelection<V, S> :
        never
    ) :
    T extends BlueprintArray<infer U> ? (
        U extends Model<infer M> ? BlueprintSelection<M, S> :
        U extends Blueprint ? BlueprintSelection<U, S> :
        never
    ) :
    T extends Model<infer M> ? BlueprintSelection<M, S> :
    T extends Blueprint ? BlueprintSelection<T, S> :
    // T extends BlueprintArgs<infer ValueType, infer ArgsType> ? (
    //     ValueType extends BlueprintModel ? BlueprintSelection<ValueType, S> :
    //     ValueType extends Blueprint<infer M> ? BlueprintSelection<M, S> :
    //     ValueType extends BlueprintArray<infer UU> ? (
    //         UU extends BlueprintModel ? BlueprintSelection<UU, S> :
    //         never
    //     ) :
    //     never
    // ) :
    never

export type BlueprintConditionOption<P extends BlueprintAnyProperty> = {
  not?: BlueprintPropertyType<P>
} | {
  lessThan?: BlueprintPropertyType<P>
} | {
  lessThanOrEqual?: BlueprintPropertyType<P>
} | {
  moreThan?: BlueprintPropertyType<P>
} | {
  moreThanOrEqual?: BlueprintPropertyType<P>
} | {
  equal?: BlueprintPropertyType<P>
} | {
  like?: BlueprintPropertyType<P>
} | {
  between?: BlueprintPropertyType<P>
} | {
  in?: BlueprintPropertyType<P>
} | {
  any?: BlueprintPropertyType<P>
} | {
  isNull?: boolean
}

export type BlueprintOrdering<T extends Blueprint> = {
  [P in keyof T]?: "asc" | "desc"
}

export type BlueprintCondition<T extends Blueprint> = {
  [P in keyof T]?: BlueprintPropertyType<T[P]> | BlueprintConditionOption<T[P]>
}

