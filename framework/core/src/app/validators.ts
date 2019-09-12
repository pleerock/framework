import {Blueprint} from "./core";
import {Model} from "./operators";
import {ModelHelper} from "./helpers";

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

export function validator<ModelBlueprint extends Blueprint>(
  model: ModelHelper<any, any, ModelBlueprint, any>,
  schema: ValidationSchema<ModelBlueprint>
) {
  return new ModelValidator(model.model, schema)
}
