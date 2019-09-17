import {Blueprint, BlueprintPrimitiveProperty, InputBlueprint, SelectionSchema} from "./core";

export class BlueprintOperator {

}

export class BlueprintOptional<Type extends BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any> | BlueprintSelection<any, any>> extends BlueprintOperator {
  instanceof: "BlueprintOptional" = "BlueprintOptional"
  constructor(public option: Type) {
    super()
  }
}

export function optional<Type extends BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any>>(option: Type) {
  return new BlueprintOptional(option)
}

export class BlueprintNullable<Type extends BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any> | BlueprintSelection<any, any>> extends BlueprintOperator {
  instanceof: "BlueprintNullable" = "BlueprintNullable"
  constructor(public option: Type) {
    super()
  }
}

export function nullable<Type extends BlueprintPrimitiveProperty | Blueprint | BlueprintArray<any> | Model<any>>(option: Type) {
  return new BlueprintNullable(option)
}


export class BlueprintArray<Type extends BlueprintPrimitiveProperty | Blueprint | Model<any> | BlueprintSelection<any, any>> extends BlueprintOperator {
  instanceof: "BlueprintArray" = "BlueprintArray"
  constructor(public option: Type) {
    super()
  }
}

export function array<Type extends BlueprintPrimitiveProperty | Blueprint | Model<any> | BlueprintSelection<any, any>>(option: Type) {
  return new BlueprintArray(option)
}

export class InputArray<Type extends BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>> extends BlueprintOperator {
  instanceof: "InputArray" = "InputArray"
  constructor(public option: Type) {
    super()
  }
}

export function inputArray<Type extends BlueprintPrimitiveProperty | InputBlueprint | Input<any> | InputReference<any>>(option: Type) {
  return new InputArray(option)
}

export class BlueprintArgs<
  ValueType extends BlueprintPrimitiveProperty | Blueprint | Model<any> | ModelReference<any> | BlueprintArray<any> | BlueprintSelection<any, any> | BlueprintOptional<any>,
  ArgsType extends InputBlueprint | Input<any> | InputReference<any>
  > extends BlueprintOperator {
  instanceof: "BlueprintArgs" = "BlueprintArgs"
  constructor(public valueType: ValueType, public argsType: ArgsType) {
    super()
  }
}

export function args<
  ValueType extends BlueprintPrimitiveProperty | Blueprint | Model<any> | ModelReference<any> | BlueprintArray<any> | BlueprintSelection<any, any> | BlueprintOptional<any>,
  ArgsType extends InputBlueprint | Input<any> | InputReference<any>
  >(
  valueType: ValueType,
  argsType: ArgsType
) {
  return new BlueprintArgs(valueType, argsType)
}

export class Model<T extends Blueprint> extends BlueprintOperator {
  instanceof: "Model" = "Model"
  constructor(public name: string, public blueprint: T) {
    super()
  }
}

export function model<T extends Blueprint>(name: string, blueprint: T) {
  return new Model(name, blueprint)
}

export class ModelReference<T extends Model<any>> extends BlueprintOperator {
  instanceof: "ModelReference" = "ModelReference"
  blueprint!: T
  constructor(public name: string) {
    super()
  }
}

export function reference<T extends Model<any>>(name: string) {
  return new ModelReference<T>(name)
}

export class Input<T extends InputBlueprint> extends BlueprintOperator {
  instanceof: "Input" = "Input"
  constructor(public name: string, public blueprint: T) {
    super()
  }
}

export function input<T extends InputBlueprint>(name: string, blueprint: T) {
  return new Input(name, blueprint)
}

export class InputReference<T extends Input<any>> extends BlueprintOperator {
  instanceof: "InputReference" = "InputReference"
  blueprint!: T
  constructor(public name: string) {
    super()
  }
}

export function inputReference<T extends Input<any>>(name: string) {
  return new InputReference<T>(name)
}


export class BlueprintSelection<T extends Blueprint, S extends SelectionSchema<T>> extends BlueprintOperator {
  instanceof: "Selection" = "Selection"
  constructor(public blueprint: Model<T>, public schema?: S) {
    super()
  }
}

export function selection<T extends Blueprint, S extends SelectionSchema<T>>(blueprint: Model<T>, schema?: S) {
  return new BlueprintSelection<T, S>(blueprint, schema)
}
