import {ApplicationProperties, ContextList} from "../app";
import {Input} from "../types";
import {InputValidator, ValidationSchema, ValidatorOptions} from "../validation";

/**
 * Input manager.
 */
export class InputManager<
  I extends Input<any>,
  Context extends ContextList
  > {

  /**
   * Application's properties.
   */
  readonly appProperties: ApplicationProperties

  /**
   * Input name.
   */
  readonly name: string

  /**
   * Input instance.
   */
  readonly input: I

  /**
   * List of input validators.
   */
  readonly validators: InputValidator<I["blueprint"]>[] = []

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    input: I,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.input = input
  }

  /**
   * Registers a new input validator.
   */
  validator(
    schema: ValidationSchema<I["blueprint"]>,
    options?: ValidatorOptions
  ): this {
    this.validators.push(new InputValidator(this.input, schema, options))
    return this
  }

}
