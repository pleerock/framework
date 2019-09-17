import {BlueprintAnyProperty} from "../types";

/**
 * Defines what args declaration can accept.

export type DeclarationArgs =
  | InputBlueprint
  | Input<any>
  | InputReference<any> */

/**
 * Defines what declaration can return.

export type DeclarationReturn =
  | BlueprintPrimitiveProperty // todo: check if we really can return it
  | Blueprint
  | BlueprintArray<any>
  | BlueprintOptional<any> // todo: check if we really can return it
  | Model<any>
  | ModelReference<any> */
