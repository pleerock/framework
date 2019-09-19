import {NumberValidationConstraints} from "./NumberValidationConstraints";
import {StringValidationConstraints} from "./StringValidationConstraints";

/**
 * All validation schema constraints.
 */
export type ValidationSchemaConstraints =
  | StringValidationConstraints
  | NumberValidationConstraints
