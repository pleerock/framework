import {DeclarationSelector, DeclarationSelectorResult} from "./selection";

export type AggregateOptions = {
  [key: string]: DeclarationSelector<any, any, any>
}

export type AggregateOptionsType<Options extends AggregateOptions> = {
  [P in keyof Options]:
  Options[P] extends DeclarationSelector<infer QueryOptions, infer Key, infer Options>
    ? DeclarationSelectorResult<QueryOptions, Key, Options>
    : unknown
}
