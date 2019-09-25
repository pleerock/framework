import {Repository} from "typeorm";

export type CustomRepositoryFactory<
  R extends Repository<any>,
  CustomRepositoryDefinition extends Object
> = (repository: R) => CustomRepositoryDefinition
