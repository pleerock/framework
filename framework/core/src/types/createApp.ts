import {Application, DeclarationBlueprint} from "../app";
import {ApplicationOptions, ContextList, InputList, ModelList} from "../app";

export function createApp<
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  >(options: ApplicationOptions<Queries, Mutations, Models, Inputs, Context>) {
  return new Application<Queries, Mutations, Models, Inputs, Context>(options)
}
