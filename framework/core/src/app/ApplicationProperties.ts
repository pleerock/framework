import {EntityHelper} from "./helpers";
import {Connection} from "typeorm";
import {ContextResolver, Resolver} from "./resolvers";
import {InputValidator, ModelValidator} from "./validators";
import {ApplicationClient} from "../client";

export type ApplicationProperties = {
  client?: ApplicationClient
  dataSource?: Connection
  context: ContextResolver<any>
  readonly resolvers: Resolver[]
  readonly entities: EntityHelper<any>[]
  readonly modelValidators: ModelValidator<any>[]
  readonly inputValidators: InputValidator<any>[]
}
