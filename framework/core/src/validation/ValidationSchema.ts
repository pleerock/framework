import {Blueprint, InputBlueprint} from "../types";


// todo: specify all validation options
// todo: validation can be really different depend on blueprint property type, specify all types

/**
 * All validation schema constraints.
 */
export type ValidationSchemaConstraints =  {
  min?: number,
  max?: number,
  maxLength?: number,
  minLength?: number,
}

/**
 * Blueprint validation schema.
 */
export type ValidationSchema<T extends Blueprint | InputBlueprint> = {
  [P in keyof T]?: ValidationSchemaConstraints
}

/**
 * Additional validation options.
 */
export type ValidatorOptions = {

  /**
   * Custom validation function - takes in the whole object (input or model) and performs validation.
   * Validation can be performed asynchronously.
   */
  validate?: (obj: any) => boolean | Promise<boolean>

}
