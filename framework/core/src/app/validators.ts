import {Blueprint, InputBlueprint} from "./core";
import {Input, Model} from "./operators";

export type ValidationSchemaPropertyOptions =  {
  min?: number,
  max?: number,
  maxLength?: number,
  minLength?: number,
}

export const validateValue = (key: string, value: any, options: ValidationSchemaPropertyOptions) => {
  if (options.maxLength !== undefined) {
    if (value.length > options.maxLength) {
      throw new Error(`Validation error: ${key} ("maxLength")`)
    }
  }
  if (options.minLength !== undefined) {
    if (value.length < options.minLength) {
      throw new Error(`Validation error: ${key} ("minLength")`)
    }
  }
  if (options.max !== undefined) {
    if (value > options.max) {
      throw new Error(`Validation error: ${key} ("max")`)
    }
  }
  if (options.min !== undefined) {
    if (value < options.min) {
      throw new Error(`Validation error: ${key} ("min")`)
    }
  }
}

export type ValidationSchema<T extends Blueprint | InputBlueprint> = {
  [P in keyof T]?: ValidationSchemaPropertyOptions
}

export type ValidatorOptions = {
  validate?: (obj: any) => boolean | Promise<boolean>
}

export class ModelValidator<B extends Blueprint> {
  constructor(public model: Model<B>,
              public schema: ValidationSchema<B>,
              public options?: ValidatorOptions) {
  }
}

export class InputValidator<B extends InputBlueprint> {
  constructor(public input: Input<B>,
              public schema: ValidationSchema<B>,
              public options?: ValidatorOptions) {
  }
}
