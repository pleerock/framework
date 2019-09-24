import {NumberValidationConstraints, StringValidationConstraints} from "..";
import {
  Blueprint,
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable,
  FloatConstructor,
  InputBlueprint
} from "../../types";

/**
 * Validation schema for a Blueprint of the model or input.
 */
export type ValidationSchema<T extends Blueprint | InputBlueprint> = {
  [P in keyof T]?:
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
    ) :
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
}
