import {BlueprintPropertyType, model, reference} from "../../src/app";

const PersonModel = model("Person", {
    id: Number,
    name: String,
    age: Number,
})

const PhotoModel = model("Photo", {
    id: Number,
    filename: String,
})

const PhotoModelRef = reference<typeof PhotoModel>("Photo")

export type ofString    = BlueprintPropertyType<StringConstructor>
export type ofNumber    = BlueprintPropertyType<NumberConstructor>
export type ofBoolean   = BlueprintPropertyType<BooleanConstructor>
export type ofBlueprint = BlueprintPropertyType<{
    id: NumberConstructor,
    name: StringConstructor,
    active: BooleanConstructor,
}>
export type ofModel = BlueprintPropertyType<typeof PersonModel>
export type ofReference = BlueprintPropertyType<typeof PhotoModelRef>
