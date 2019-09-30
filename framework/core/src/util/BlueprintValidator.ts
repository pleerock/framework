import {Float, TypeCheckers} from "../index";
import {Errors} from "../errors";
import {AnyBlueprint} from "../types";

/**
 * Validates a given blueprint
 */
export const BlueprintValidator = {

  /**
   * Validates a given object against given blueprint and throws exception if there is a mismatch.
   */
  validate(value: any, blueprint: AnyBlueprint) {
    const valueType = typeof value
    if (TypeCheckers.isBlueprintPrimitiveProperty(blueprint)) {
      if (blueprint === String) {
        if (valueType !== "string")
          throw Errors.blueprintValidationTypeMismatch("string", valueType)

      } else if (blueprint === Number) {
        if (valueType !== "number")
          throw Errors.blueprintValidationTypeMismatch("number", valueType)

      } else if (blueprint === Boolean) {
        if (valueType !== "boolean")
          throw Errors.blueprintValidationTypeMismatch("boolean", valueType)

      } else if (TypeCheckers.isFloat(blueprint)) {
        if (valueType !== "number")
          throw Errors.blueprintValidationTypeMismatch("number", valueType)
      }

    } else if (TypeCheckers.isBlueprintArray(blueprint)) {
      if (!(value instanceof Array))
        throw Errors.blueprintValidationTypeMismatch("Array", valueType)

      for (let index in value) {
        this.validate(value[index], blueprint.option)
      }

    } else if (TypeCheckers.isBlueprintNullable(blueprint)) {
      if (value !== null) {
        this.validate(value, blueprint.option)
      }

    } else if (TypeCheckers.isBlueprintArgs(blueprint)) {
      this.validate(value, blueprint.valueType)

    } else if (TypeCheckers.isModel(blueprint)) {
      this.validate(value, blueprint.blueprint)

    } else if (TypeCheckers.isModelReference(blueprint)) {
      this.validate(value, blueprint.blueprint)

    } else if (TypeCheckers.isBlueprint(blueprint)) {
      if (!(value instanceof Object))
        throw Errors.blueprintValidationTypeMismatch("Object", valueType)
      if (value instanceof Array)
        throw Errors.blueprintValidationTypeMismatch("Array", valueType)

      for (let key in blueprint) {
        this.validate(value[key], blueprint[key])
      }
    }

  }

}
