import {ValidationSchemaConstraints} from "..";

/**
 * Validator implementation should implement this type for framework to execute a validation.
 */
export type Validator = (options: {
  key: string,
  value: any,
  options: ValidationSchemaConstraints
}) => void | Promise<void>
