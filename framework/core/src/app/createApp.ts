import {ActionBlueprint, Application, DeclarationBlueprint} from "./index";
import {ApplicationOptions, ContextList, InputList, ModelList} from "./index";

export function createApp<
  Actions extends ActionBlueprint,
  Queries extends DeclarationBlueprint,
  Mutations extends DeclarationBlueprint,
  Subscriptions extends DeclarationBlueprint,
  Models extends ModelList,
  Inputs extends InputList,
  Context extends ContextList,
  >(options: ApplicationOptions<Actions, Queries, Mutations, Subscriptions, Models, Inputs, Context>) {
  return new Application<Actions, Queries, Mutations, Subscriptions, Models, Inputs, Context>(options)
}
