import {
  AnyApplication,
  AnyBlueprint,
  AnyInput,
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable,
  Input,
  InputReference,
  InputValidator,
  Model,
  ModelReference,
} from "@microframework/core"
import {ModelValidator} from "@microframework/core";
import {TypeCheckers} from "@microframework/core/_";

/**
 * Validates given input or model.
 */
export async function validate(
  app: AnyApplication,
  modelOrInput: AnyInput | AnyBlueprint,
  value: any,
  context: any
): Promise<void> {

  // skip if validator wasn't defined in application bootstrap
  if (!app.properties.validator)
    return
  if (value === undefined || value === null)
    return

  if (TypeCheckers.isBlueprintArray(modelOrInput)) {
    for (const subVal of value) {
      await validate(app, modelOrInput.option, subVal, context)
    }

  } else if (TypeCheckers.isBlueprintArgs(modelOrInput)) {
    await validate(app, modelOrInput.valueType, value, context)

  } else if (TypeCheckers.isBlueprintNullable(modelOrInput)) {
    await validate(app, modelOrInput.option, value, context)

  } else if (
    TypeCheckers.isModelReference(modelOrInput) ||
    TypeCheckers.isInputReference(modelOrInput) ||
    TypeCheckers.isModel(modelOrInput) ||
    TypeCheckers.isInput(modelOrInput) ||
    modelOrInput instanceof Object
  ) {

    // find given input/model validators
    let validators: (InputValidator<any, any> | ModelValidator<any, any>)[] = []
    if (
      TypeCheckers.isInputReference(modelOrInput) ||
      TypeCheckers.isInput(modelOrInput)
    ) {
      validators = app
        .input(modelOrInput.name)
        .validators

    } else if (
      TypeCheckers.isModelReference(modelOrInput) ||
      TypeCheckers.isModel(modelOrInput)
    ) {
      validators = app
        .model(modelOrInput.name)
        .validators
    }

    // find blueprint we are going to validate
    let blueprint: any
    if (TypeCheckers.isModelReference(modelOrInput)) {
      blueprint = modelOrInput.blueprint
    } else if (TypeCheckers.isInputReference(modelOrInput)) {
      blueprint = modelOrInput.blueprint
    } else if (TypeCheckers.isModel(modelOrInput)) {
      blueprint = modelOrInput.blueprint
    } else if (TypeCheckers.isInput(modelOrInput)) {
      blueprint = modelOrInput.blueprint
    } else {
      blueprint = modelOrInput
    }

    // if validator has validate function specified, use it
    for (const validator of validators) {
      if (validator.modelValidator) {
        let result = validator.modelValidator(value, context)
        if (result) await result
      }
    }

    // validate blueprint properties
    for (const key in blueprint) {
      const blueprintItem = blueprint[key]

      for (const validator of validators) {
        if (validator.validationSchema) {
          const validationSchema = validator.validationSchema[key]
          if (validationSchema) {
            if (validationSchema instanceof Function) {
              let result = validationSchema(value[key], value, context)
              if (result instanceof Promise) {
                result = await result
              }
              value[key] = result
            } else {
              app.properties.validator({
                key: key,
                value: value[key],
                options: validationSchema
              })
            }
          }
        }
      }

      // if its a sub-object validate nested properties
      if (
        TypeCheckers.isBlueprintArray(blueprintItem) ||
        TypeCheckers.isModelReference(blueprintItem) ||
        TypeCheckers.isInputReference(blueprintItem) ||
        TypeCheckers.isModel(blueprintItem) ||
        TypeCheckers.isInput(blueprintItem) ||
        blueprintItem instanceof Object /* this one means input blueprint */
      ) {
        await validate(app, blueprintItem, value[key], context)
      }
    }
  }
}
