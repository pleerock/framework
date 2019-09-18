import {Model} from "../types";
import {ValidationSchema, ValidatorOptions} from "./ValidationSchema";

/**
 * Model validation definition.
 */
export class ModelValidator<M extends Model<any>> {
  constructor(public model: M,
              public schema: ValidationSchema<M["blueprint"]>,
              public options?: ValidatorOptions) {
  }
}
