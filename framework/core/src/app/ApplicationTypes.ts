import {
  AnyBlueprint, AnyBlueprintType,
  AnyInput, AnyInputType, AnyRootInput,
  Blueprint,
  BlueprintAnyProperty,
  BlueprintPrimitiveProperty,
  Input,
  Model
} from "../types";

/**
 * Blueprint for root declarations.
 */
export type DeclarationBlueprint = {
  [key: string]: BlueprintAnyProperty
}

/**
 * Action used for HTTP route queries.
 */
export type ActionType<A extends Action> = {
  params: A["params"] extends AnyRootInput ? AnyInputType<A["params"]> : never
  query: A["query"] extends AnyRootInput ? AnyInputType<A["query"]> : never
  header: A["header"] extends AnyRootInput ? AnyInputType<A["header"]> : never
  cookies: A["cookies"] extends AnyRootInput ? AnyInputType<A["cookies"]> : never
  body: A["body"] extends AnyRootInput ? AnyInputType<AnyRootInput> : never
}


/**
 * Action used for HTTP route queries.
 */
export type Action = {
  type: "get" | "post" | "patch" | "delete" | string
  return?: BlueprintAnyProperty
  params?: AnyRootInput
  query?: AnyRootInput
  header?: AnyRootInput
  cookies?: AnyRootInput
  body?: AnyRootInput
}

/**
 * Blueprint for actions (routes).
 */
export type ActionBlueprint = {
  [key: string]: Action
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
