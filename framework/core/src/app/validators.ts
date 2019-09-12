import {Blueprint} from "./core";
import {Model} from "./operators";

export type ValidationSchemaPropertyOptions =  {
  min?: number,
  max?: number,
  maxLength?: number,
  minLength?: number,
}

export type ValidationSchema<T extends Blueprint> = {
  [P in keyof T]?: ValidationSchemaPropertyOptions
}

export class ModelValidator<B extends Blueprint> {
  constructor(public model: Model<B>,
              public schema?: ValidationSchema<B>) {
  }
}

export function validator<T extends Blueprint>(model: Model<T>, schema: ValidationSchema<T>) {
  return new ModelValidator(model, schema)
}
