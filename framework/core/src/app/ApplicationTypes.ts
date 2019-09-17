import {Blueprint, BlueprintAnyProperty, BlueprintPrimitiveProperty, Input, Model} from "../types";

/**
 * Blueprint for root declarations.
 */
export type DeclarationBlueprint = {
  [key: string]: BlueprintAnyProperty
}

/**
 * List of models for application.
 */
export type ModelList = {
  [key: string]: Model<any>
}

/**
 * List of inputs for application.
 */
export type InputList = {
  [key: string]: Input<any>
}

/**
 * List of context variables.
 */
export type ContextList = {
  [key: string]:
    | Model<any>
    | Blueprint
    | BlueprintPrimitiveProperty
}
