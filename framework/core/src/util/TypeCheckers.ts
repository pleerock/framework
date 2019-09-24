import {
  Blueprint,
  BlueprintArgs,
  BlueprintArray,
  BlueprintOperator,
  BlueprintOptional,
  BlueprintPrimitiveProperty,
  BlueprintSelection,
  Input,
  InputArray,
  InputBlueprint,
  InputReference,
  Model,
  ModelReference, NullableInput
} from "../types";

export const TypeCheckers = {
  isBlueprintPrimitiveProperty(value: any): value is BlueprintPrimitiveProperty {
    return value === String || value === Number || value === Boolean
  },
  isBlueprintOperator(value: any): value is Blueprint {
    return value instanceof BlueprintOperator
  },
  isBlueprintArray(value: any): value is BlueprintArray<any> {
    return value instanceof BlueprintArray
  },
  isBlueprintOptional(value: any): value is BlueprintOptional<any> {
    return value instanceof BlueprintOptional
  },
  // isBlueprintNullable(value: any): value is BlueprintNullable<any> {
  //   return value instanceof BlueprintNullable
  // },
  isBlueprintSelection(value: any): value is BlueprintSelection<any, any> {
    return value instanceof BlueprintSelection
  },
  isBlueprintArgs(value: any): value is BlueprintArgs<any, any> {
    return value instanceof BlueprintArgs
  },
  isModel(value: any): value is Model<any> {
    return value instanceof Model
  },
  isModelReference(value: any): value is ModelReference<any> {
    return value instanceof ModelReference
  },
  isBlueprint(value: any): value is Blueprint {
    return value instanceof Object && this.isBlueprintOperator(value) === false
  },
  isInputArray(value: any): value is InputArray<any> {
    return value instanceof InputArray
  },
  isNullableInput(value: any): value is NullableInput<any> {
    return value instanceof NullableInput
  },
  isInputBlueprint(value: any): value is InputBlueprint {
    return value instanceof Object && this.isBlueprintOperator(value) === false
  },
  isInput(value: any): value is Input<any> {
    return value instanceof Input
  },
  isInputReference(value: any): value is InputReference<any> {
    return value instanceof InputReference
  },
}
