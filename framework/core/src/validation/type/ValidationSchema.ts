import {NumberValidationConstraints, StringValidationConstraints} from "..";
import {ContextList} from "../../app";
import {
  AnyBlueprint,
  AnyBlueprintType, AnyInput, AnyInputType, AnyRootInput,
  Blueprint,
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable, BlueprintPrimitiveProperty, BlueprintSelection,
  FloatConstructor, Input,
  InputBlueprint, InputReference, Model, ModelReference
} from "../../types";

export type PropertyValidatorFn<Parent extends Blueprint | InputBlueprint, T extends AnyBlueprint | AnyRootInput, Context extends ContextList> =
  T extends BlueprintPrimitiveProperty ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends BlueprintArray<any> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends BlueprintNullable<BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any> | BlueprintSelection<any, any>> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  // T extends BlueprintNullable<InputBlueprint | InputReference<any> | Input<any>> ? (value: AnyInputType<T,  parent: (Parent extends Blueprint ? AnyBlueprintType<PP> : Parent extends InputBlueprint ? AnyInputType<PP> : unknown),context: AnyBlueprintType<Context>>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T | undefined> | undefined :
  T extends BlueprintSelection<any, any> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends BlueprintArgs<any, any> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends Model<any> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends ModelReference<any> ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends Input<any> ? (value: AnyInputType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyInputType<T> | Promise<AnyInputType<T> | undefined> | undefined :
  T extends InputReference<any> ? (value: AnyInputType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyInputType<T> | Promise<AnyInputType<T> | undefined> | undefined :
  T extends Blueprint ? (value: AnyBlueprintType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyBlueprintType<T> | Promise<AnyBlueprintType<T> | undefined> | undefined :
  T extends InputBlueprint ? (value: AnyInputType<T>, parent: (Parent extends Blueprint ? AnyBlueprintType<Parent> : Parent extends InputBlueprint ? AnyInputType<Parent> : unknown), context: AnyBlueprintType<Context>) => AnyInputType<T> | Promise<AnyInputType<T> | undefined> | undefined :
  never

/**
 * Validation schema for a Blueprint of the model or input.
 */
export type ValidationSchema<T extends Blueprint | InputBlueprint, Context extends ContextList> = {
  [P in keyof T]?:
    PropertyValidatorFn<T, T[P], Context> | (
      T[P] extends BlueprintArgs<infer ValueType, any> ? (
        ValueType extends StringConstructor ? StringValidationConstraints :
        ValueType extends NumberConstructor ? NumberValidationConstraints :
        ValueType extends FloatConstructor ? NumberValidationConstraints :
        ValueType extends BlueprintNullable<infer V> ? (
          V extends StringConstructor ? StringValidationConstraints :
          V extends NumberConstructor ? NumberValidationConstraints :
          V extends FloatConstructor ? NumberValidationConstraints :
          V extends BlueprintArray<infer I> ? (
            I extends StringConstructor ? StringValidationConstraints :
            I extends NumberConstructor ? NumberValidationConstraints :
            I extends FloatConstructor ? NumberValidationConstraints :
            never
          ) :
          never
        ) :
        never
      ) :
      T[P] extends BlueprintNullable<infer V> ? (
        V extends StringConstructor ? StringValidationConstraints :
        V extends NumberConstructor ? NumberValidationConstraints :
        V extends FloatConstructor ? NumberValidationConstraints :
        V extends BlueprintArray<infer I> ? (
          I extends StringConstructor ? StringValidationConstraints :
          I extends NumberConstructor ? NumberValidationConstraints :
          I extends FloatConstructor ? NumberValidationConstraints :
          never
        ) :
        never
      )  :
      T[P] extends BlueprintArray<infer I> ? (
        I extends StringConstructor ? StringValidationConstraints :
        I extends NumberConstructor ? NumberValidationConstraints :
        I extends FloatConstructor ? NumberValidationConstraints :
        never
      ) :
      T[P] extends StringConstructor ? StringValidationConstraints :
      T[P] extends NumberConstructor ? NumberValidationConstraints :
      T[P] extends FloatConstructor ? NumberValidationConstraints :
      never
    )
}
