import {ValidateInputFn, ValidationSchema} from "..";
import {ContextList} from "../../app";
import {Input} from "../../types";

/**
 * Input validation definition.
 */
export class InputValidator<I extends Input<any>, Context extends ContextList> {
  model: I
  validationSchema?: ValidationSchema<I["blueprint"], Context>
  modelValidator?: ValidateInputFn<I["blueprint"], Context>

  constructor(model: I, schema?: ValidationSchema<I["blueprint"], Context>) {
    this.model = model
    this.validationSchema = schema
  }

  schema(schema: ValidationSchema<I["blueprint"], Context>) {
    this.validationSchema = schema
    return this
  }

  validate(validator: ValidateInputFn<I["blueprint"], Context>) {
    this.modelValidator = validator
    return this
  }

}
