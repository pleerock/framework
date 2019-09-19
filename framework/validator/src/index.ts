import {Validator} from "@microframework/core";

export const defaultValidator: Validator = ({
  key,
  value,
  options
}) => {
  // if (options.maxLength !== undefined) {
  //   if (value.length > options.maxLength) {
  //     throw new Error(`Validation error: ${key} ("maxLength")`)
  //   }
  // }
  // if (options.minLength !== undefined) {
  //   if (value.length < options.minLength) {
  //     throw new Error(`Validation error: ${key} ("minLength")`)
  //   }
  // }
  // if (options.max !== undefined) {
  //   if (value > options.max) {
  //     throw new Error(`Validation error: ${key} ("max")`)
  //   }
  // }
  // if (options.min !== undefined) {
  //   if (value < options.min) {
  //     throw new Error(`Validation error: ${key} ("min")`)
  //   }
  // }
}
