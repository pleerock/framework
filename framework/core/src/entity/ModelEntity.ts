import {ApplicationProperties} from "../app";
import {Errors} from "../errors";
import {Model} from "../types";
import {EntityResolveSchema, EntitySchema} from "./types";

/**
 * Entity specification.
 */
export class ModelEntity<
  GivenModel extends Model<any>
  > {

  /**
   * Application's properties.
   */
  readonly appProperties: ApplicationProperties

  /**
   * Model for which we define an entity.
   */
  readonly model: Model<any>

  /**
   * Entity's schema.
   */
  entitySchema?: EntitySchema<GivenModel["blueprint"]>

  /**
   * Entity's resolving strategy.
   */
  entityResolveSchema?: EntityResolveSchema<GivenModel["blueprint"]>

  /**
   * Table name for this entity.
   */
  tableName?: string

  constructor(
    appProperties: ApplicationProperties,
    model: Model<any>
  ) {
    this.appProperties = appProperties
    this.model = model
  }

  /**
   * Sets entity table name.
   */
  table(name: string): this {
    this.tableName = name
    return this
  }

  /**
   * Sets entity automatic resolve strategy.
   */
  resolvable(schema: EntityResolveSchema<GivenModel["blueprint"]>): ModelEntity<GivenModel> {
    this.entityResolveSchema = schema
    return this
  }

  /**
   * Sets entity schema.
   */
  schema(schema: EntitySchema<GivenModel["blueprint"]>): ModelEntity<GivenModel> {
    this.entitySchema = schema
    return this
  }

  /**
   * Get's entity repository.
   */
  get repository() {
    if (!this.appProperties.dataSource)
      throw Errors.noDataSourceInApp

    return this.appProperties.dataSource.getRepository(this.model.name)
  }

}
