import {getTypes} from "../util/type-checker";

const types = getTypes([
    __dirname + "/blueprint-property-types.ts"
]);

test(`"BlueprintPropertyType<StringConstructor>" should be a type of "string"`, () => {
    const ofString = types.find(type => type.name === "ofString")
    expect(ofString).toBeDefined()
    expect(ofString!.type).toBe("string")
});

test(`"BlueprintPropertyType<NumberConstructor>" should be a type of "number"`, () => {
    const ofNumber = types.find(type => type.name === "ofNumber")
    expect(ofNumber).toBeDefined()
    expect(ofNumber!.type).toBe("number")
});

test(`"BlueprintPropertyType<BooleanConstructor>" should be a type of "boolean"`, () => {
    const ofBoolean = types.find(type => type.name === "ofBoolean")
    expect(ofBoolean).toBeDefined()
    expect(ofBoolean!.type).toBe("boolean")
});

test(`"BlueprintPropertyType<Blueprint>" should have a type of blueprint`, () => {
    const ofBlueprint = types.find(type => type.name === "ofBlueprint")
    expect(ofBlueprint).toBeDefined()
    expect(ofBlueprint!.type).toBe("{ id: number; name: string; active: boolean; } & {}")
});

test(`"BlueprintPropertyType<Model>" should have a type of model's blueprint`, () => {
    const ofModel = types.find(type => type.name === "ofModel")
    expect(ofModel).toBeDefined()
    expect(ofModel!.type).toBe("{ id: number; name: string; age: number; } & {}")
});

test(`"BlueprintPropertyType<ModelReference>" should have a type of reference's model's blueprint`, () => {
    const ofReference = types.find(type => type.name === "ofReference")
    expect(ofReference).toBeDefined()
    expect(ofReference!.type).toBe("{ id: number; filename: string; } & {}")
});
