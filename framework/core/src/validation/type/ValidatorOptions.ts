import {ContextList} from "../../app";
import {AnyBlueprintType, AnyInputType, Blueprint, InputBlueprint} from "../../types";

export type ValidateModelFn<B extends Blueprint, Context extends ContextList> = (obj: AnyBlueprintType<B>, context: AnyBlueprintType<Context>) => void | Promise<void>

export type ValidateInputFn<B extends InputBlueprint, Context extends ContextList> = (obj: AnyInputType<B>, context: AnyBlueprintType<Context>) => void | Promise<void>
