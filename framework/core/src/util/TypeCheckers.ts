import {
  Blueprint,
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable,
  BlueprintPrimitiveProperty,
  BlueprintSelection,
  Input,
  InputBlueprint,
  InputReference,
  Model,
  ModelReference,
  Float
} from "../types";

export const TypeCheckers = {
  isBlueprintPrimitiveProperty(value: any): value is BlueprintPrimitiveProperty {
    return value === String || value === Number || value === Boolean || value === Float
  },
  isBlueprintOperator(value: any): value is Blueprint {
    return this.isBlueprintArray(value) ||
      this.isBlueprintNullable(value) ||
      this.isBlueprintSelection(value) ||
      this.isBlueprintArgs(value)
  },
  isBlueprintArray(value: any): value is BlueprintArray<any> {
    return value instanceof Object && value.instanceof === "BlueprintArray"
  },
  isBlueprintNullable(value: any): value is BlueprintNullable<any> {
    return value instanceof Object && value.instanceof === "BlueprintNullable"
  },
  isBlueprintSelection(value: any): value is BlueprintSelection<any, any> {
    return value instanceof Object && value.instanceof === "BlueprintSelection"
  },
  isBlueprintArgs(value: any): value is BlueprintArgs<any, any> {
    return value instanceof Object && value.instanceof === "BlueprintArgs"
  },
  isModel(value: any): value is Model<any> {
    return value instanceof Object && value.instanceof === "Model"
  },
  isModelReference(value: any): value is ModelReference<any> {
    return value instanceof Object && value.instanceof === "ModelReference"
  },
  isBlueprint(value: any): value is Blueprint {
    return value instanceof Object && this.isBlueprintOperator(value) === false
  },
  isInputBlueprint(value: any): value is InputBlueprint {
    return value instanceof Object && this.isBlueprintOperator(value) === false
  },
  isInput(value: any): value is Input<any> {
    return value instanceof Object && value.instanceof === "Input"
  },
  isInputReference(value: any): value is InputReference<any> {
    return value instanceof Object && value.instanceof === "InputReference"
  },
}
