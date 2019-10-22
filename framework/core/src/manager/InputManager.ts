import {ApplicationProperties, ContextList} from "../app";
import {Input} from "../types";
import {InputValidator, ValidationSchema} from "../validation";

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
  validator(schema: ValidationSchema<I["blueprint"], Context>): InputValidator<I, Context> {
    return new InputValidator(this.input, schema)
  }

}

