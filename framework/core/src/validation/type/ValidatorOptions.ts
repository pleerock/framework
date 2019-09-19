/**
 * Additional validation options.
 */
export type ValidatorOptions = {

  /**
   * Custom validation function - takes in the whole object (input or model) and performs validation.
   * Validation can be performed asynchronously.
   */
  validate?: (obj: any) => void | Promise<void> // todo: add options with input and model in?

}
