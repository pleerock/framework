import {Application} from "./Application";
import {ApplicationOptions, ContextList, InputList, ModelList} from "./ApplicationOptions";
import {DeclarationList} from "./declarations";

export function createApp<
  Queries extends DeclarationList,
  Mutations extends DeclarationList,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  >(options: ApplicationOptions<Queries, Mutations, Models, Inputs, Context>) {
  return new Application<Queries, Mutations, Models, Inputs, Context>(options)
}
