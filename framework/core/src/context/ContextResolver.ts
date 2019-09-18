import {ContextList} from "../app";
import {AnyBlueprintType} from "../types";

/**
 * Type for context resolver.
 *
 * todo: add request/response parameters
 */
export type ContextResolver<Context extends ContextList> = {
  [P in keyof Context]: (options: { request: any }) => AnyBlueprintType<Context[P]> | Promise<AnyBlueprintType<Context[P]>>
}
