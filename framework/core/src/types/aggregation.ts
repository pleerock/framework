import {DeclarationSelector, DeclarationSelectorResult} from "./selection";

export type AggregateOptions = {
  [key: string]: DeclarationSelector<any, any>
}

export type AggregateOptionsType<Options extends AggregateOptions> = {
  [P in keyof Options]:
    Options[P] extends DeclarationSelector<infer Declaration, infer Selection>
      ? DeclarationSelectorResult<Declaration, Selection>
      : unknown
}
