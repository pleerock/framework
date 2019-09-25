import {ValidateModelFn, ValidationSchema} from "..";
import {ContextList} from "../../app";
import {Model} from "../../types";

/**
 * Model validation definition.
 */
export class ModelValidator<M extends Model<any>, Context extends ContextList> {
  model: M
  validationSchema?: ValidationSchema<M["blueprint"], Context>
  modelValidator?: ValidateModelFn<M["blueprint"], Context>

  constructor(model: M, schema?: ValidationSchema<M["blueprint"], Context>) {
    this.model = model
    this.validationSchema = schema
  }

  schema(schema: ValidationSchema<M["blueprint"], Context>) {
    this.validationSchema = schema
    return this
  }

  validate(validator: ValidateModelFn<M["blueprint"], Context>) {
    this.modelValidator = validator
    return this
  }

}
