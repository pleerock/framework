import {DeclarationList, DeclarationReturn} from "./declarations";
import {
  AnyBlueprintSelectionType,
  AnyBlueprintType,
  AnyInput,
  AnyInputType,
  Blueprint,
  InputBlueprint,
  SelectionSchema
} from "./core";
import {BlueprintArray, Input, InputReference, Model} from "./operators";

/**
 * Selection subset of the particular model / blueprint with args applied if they are defined.
 */
export type DeclarationSelection<Return extends DeclarationReturn, Args extends AnyInput | undefined> =
  Args extends DeclarationReturn ?
    {
      select:
        Return extends Model<any> ? SelectionSchema<Return["blueprint"]> :
        Return extends BlueprintArray<infer U> ?
          U extends Blueprint ? SelectionSchema<U> :
          U extends Model<infer MM> ? SelectionSchema<MM> :
          never :
        never
      args:
        Args extends (InputBlueprint | Input<any> | InputReference<any>) ? AnyInputType<Args> :
        never
    } : {
      select:
        Return extends Model<infer M> ? SelectionSchema<M> :
        Return extends Blueprint ? SelectionSchema<Return> :
        Return extends BlueprintArray<infer U> ?
          U extends Blueprint ? SelectionSchema<U> :
          U extends Model<infer MM> ? SelectionSchema<MM> :
          never :
        never
    }

/**
 * Defines a type of the selected value.
 */
export type DeclarationSelectorResult<
  AllDeclarations extends DeclarationList,
  DeclarationName extends keyof AllDeclarations,
  Options extends DeclarationSelection<AllDeclarations[DeclarationName]["return"], AllDeclarations[DeclarationName]["args"]>
> =
  AllDeclarations[DeclarationName]["return"] extends BlueprintArray<any>
    ? AnyBlueprintType<AnyBlueprintSelectionType<AllDeclarations[DeclarationName]["return"], Options["select"]>>[]
    : AnyBlueprintType<AnyBlueprintSelectionType<AllDeclarations[DeclarationName]["return"], Options["select"]>>

/**
 * Operates over selected peace of data.
 */
export class DeclarationSelector<
  AllDeclarations extends DeclarationList,
  DeclarationName extends keyof AllDeclarations,
  Selection extends DeclarationSelection<AllDeclarations[DeclarationName]["return"], AllDeclarations[DeclarationName]["args"]>
> {
  constructor(private name: DeclarationName, private options: Selection) {
  }

  /**
   * Fetches the selected data.
   */
  async fetch(): Promise<DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>> {
    return undefined as any
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: DeclarationSelectorResult<AllDeclarations, DeclarationName, Selection>) => any) {
  }

}
