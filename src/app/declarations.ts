import {
  Blueprint,
  BlueprintArray,
  BlueprintOptional,
  BlueprintPrimitiveProperty,
  Input,
  InputBlueprint,
  InputReference,
  Model,
  ModelReference
} from "./index";

export class RootDeclaration<T extends DeclarationList> {
  constructor(type: "query" | "mutation", public options: T) {
  }
}

export function queries<T extends DeclarationList>(options: T) {
  return new RootDeclaration("query", options)
}

export function mutations<T extends DeclarationList>(options: T) {
  return new RootDeclaration("mutation", options)
}

/**
 * List of declarations
 */
export type DeclarationList = {
  [key: string]: Declaration
}

/**
 * Declaration of the mutation or query.
 * Args stands for accepted arguments and return stands for returned type.
 */
export type Declaration = {
  args?: DeclarationArgs,
  return: DeclarationReturn
}

/**
 * Defines what args declaration can accept.
 */
export type DeclarationArgs =
  | InputBlueprint
  | Input<any>
  | InputReference<any>

/**
 * Defines what declaration can return.
 */
export type DeclarationReturn =
  | BlueprintPrimitiveProperty // todo: check if we really can return it
  | Blueprint
  | BlueprintArray<any>
  | BlueprintOptional<any> // todo: check if we really can return it
  | Model<any>
  | ModelReference<any>
