import {
  AnyApplication,
  AnyBlueprint,
  AnyInput,
  BlueprintArgs,
  BlueprintArray,
  BlueprintNullable,
  Input,
  InputArray,
  InputReference,
  InputValidator,
  Model,
  ModelReference,
} from "@microframework/core"
import {ModelValidator} from "@microframework/core";

/**
 * Validates given input or model.
 */
export async function validate(
  app: AnyApplication,
  modelOrInput: AnyInput | AnyBlueprint,
  value: any
): Promise<void> {

  // skip if validator wasn't defined in application bootstrap
  if (!app.properties.validator)
    return
  if (value === undefined || value === null)
    return

  if (modelOrInput instanceof InputArray) {
    for (const subArgs of value) {
      await validate(app, modelOrInput.option, subArgs)
    }

  } else if (modelOrInput instanceof BlueprintArray) {
    for (const subVal of value) {
      await validate(app, modelOrInput.option, subVal)
    }

  } else if (modelOrInput instanceof BlueprintArgs) {
    await validate(app, modelOrInput.valueType, value)

  } else if (modelOrInput instanceof BlueprintNullable) {
    await validate(app, modelOrInput.option, value)

  } else if (
    modelOrInput instanceof ModelReference ||
    modelOrInput instanceof Model ||
    modelOrInput instanceof InputReference ||
    modelOrInput instanceof Input ||
    modelOrInput instanceof Object
  ) {

    // find given input/model validators
    let validators: (InputValidator<any> | ModelValidator<any>)[] = []
    if (modelOrInput instanceof InputReference || modelOrInput instanceof Input) {
      validators = app
        .input(modelOrInput.name)
        .validators

    } else if (modelOrInput instanceof ModelReference || modelOrInput instanceof Model) {
      validators = app
        .model(modelOrInput.name)
        .validators
    }

    // find blueprint we are going to validate
    let blueprint: any
    if (modelOrInput instanceof ModelReference) {
      blueprint = modelOrInput.blueprint
    } else if (modelOrInput instanceof Model) {
      blueprint = modelOrInput.blueprint
    } else if (modelOrInput instanceof InputReference) {
      blueprint = modelOrInput.blueprint
    } else if (modelOrInput instanceof Input) {
      blueprint = modelOrInput.blueprint
    } else {
      blueprint = modelOrInput
    }

    // if validator has validate function specified, use it
    for (const validator of validators) {
      if (validator.options && validator.options.validate) {
        let result = validator.options.validate(value)
        if (result) await result
      }
    }

    // validate blueprint properties
    for (const key in blueprint) {
      const blueprintItem = blueprint[key]

      for (const validator of validators) {
        const validationSchema = validator.schema[key]
        if (validationSchema) {
          app.properties.validator({
            key: key,
            value: value[key],
            options: validationSchema
          })
        }
      }

      // if its a sub-object validate nested properties
      if (
        blueprintItem instanceof InputReference ||
        blueprintItem instanceof Input ||
        blueprintItem instanceof InputArray ||
        blueprintItem instanceof ModelReference ||
        blueprintItem instanceof Model ||
        blueprintItem instanceof BlueprintArray ||
        blueprintItem instanceof Object /* this one means input blueprint */
      ) {
        await validate(app, blueprintItem, value[key])
      }
    }
  }
}
