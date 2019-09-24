import {NumberValidationConstraints, StringValidationConstraints} from "..";
import {Blueprint, BlueprintArgs, BlueprintArray, BlueprintOptional, InputBlueprint} from "../../types";

/**
 * Validation schema for a Blueprint of the model or input.
 */
export type ValidationSchema<T extends Blueprint | InputBlueprint> = {
  [P in keyof T]?:
    T[P] extends BlueprintArgs<infer ValueType, any> ? (
      ValueType extends StringConstructor ? StringValidationConstraints :
      ValueType extends NumberConstructor ? NumberValidationConstraints :
      ValueType extends BlueprintOptional<infer V> ? (
        V extends StringConstructor ? StringValidationConstraints :
        V extends NumberConstructor ? NumberValidationConstraints :
        V extends BlueprintArray<infer I> ? (
          I extends StringConstructor ? StringValidationConstraints :
          I extends NumberConstructor ? NumberValidationConstraints :
          never
        ) :
        never
      ) :
      never
    ) :
    T[P] extends BlueprintOptional<infer V> ? (
      V extends StringConstructor ? StringValidationConstraints :
      V extends NumberConstructor ? NumberValidationConstraints :
      V extends BlueprintArray<infer I> ? (
        I extends StringConstructor ? StringValidationConstraints :
        I extends NumberConstructor ? NumberValidationConstraints :
        never
      ) :
      never
    ) :
    T[P] extends BlueprintArray<infer I> ? (
      I extends StringConstructor ? StringValidationConstraints :
      I extends NumberConstructor ? NumberValidationConstraints :
      never
    ) :
    T[P] extends StringConstructor ? StringValidationConstraints :
    T[P] extends NumberConstructor ? NumberValidationConstraints :
    never
}
