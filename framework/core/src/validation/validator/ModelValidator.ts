import {ValidationSchema, ValidatorOptions} from "..";
import {Model} from "../../types";

/**
 * Model validation definition.
 */
export class ModelValidator<M extends Model<any>> {
  constructor(public model: M,
              public schema: ValidationSchema<M["blueprint"]>,
              public options?: ValidatorOptions) {
  }
}
