import {ValidationSchema, ValidatorOptions} from "..";
import {Input} from "../../types";

/**
 * Input validation definition.
 */
export class InputValidator<I extends Input<any>> {
  constructor(public input: I,
              public schema: ValidationSchema<I["blueprint"]>,
              public options?: ValidatorOptions) {
  }
}
