import {EntitySchemaColumnOptions} from "typeorm";
import {Blueprint, BlueprintAnyProperty} from "./core";
import {Model, ModelReference} from "./operators";

export enum ColumnTypes {
  INT,
  FLOAT,
  VARCHAR,
  TEXT,
}

export const RelationTypes = {
  OneToOne: "OneToOne" as const,
  ManyToOne: "ManyToOne" as const,
  OneToMany: "OneToMany" as const,
  ManyToMany: "ManyToMany" as const,
}

export const GeneratedTypes = {
  UUID: "UUID" as const,
  INCREMENT: "INCREMENT" as const,
}

// export type EntitySchemaColumnOptions = {
//   primary?: boolean
//   default?: string
//   generated?: keyof typeof GeneratedTypes
//   type: string
// }

export type EntitySchemaRelationOptions = {
  relation: "OneToOne"
  joinColumn: true
  inverseSide?: string
} | {
  relation: "OneToOne"
  joinColumn: false
  inverseSide: string
} | {
  relation: "OneToMany"
  inverseSide: string
} | {
  relation: "ManyToOne"
  inverseSide?: string
} | {
  relation: "ManyToMany"
  joinTable: false
  inverseSide: string
} | {
  relation: "ManyToMany"
  joinTable: true
  inverseSide?: string
}

export type EntitySchemaProperty<P extends BlueprintAnyProperty> =
  P extends Model<any> ? EntitySchemaRelationOptions :
  P extends ModelReference<any> ? EntitySchemaRelationOptions :
  // P extends Blueprint ? EntitySchemaRelationOptions : // todo: maybe embedded here yaaai
  EntitySchemaColumnOptions

export type EntitySchema<T extends Blueprint> = {

  /**
   * Indicates if server must automatically resolve entity properties.
   * If set to true, resolves all properties.
   * Defaults to false.
   *
   * You can also specify list of particular properties you want to automatically resolve.
   */
  resolve?: boolean | {
    [P in keyof T]?:
      T[P] extends Model<any> ? boolean :
      T[P] extends ModelReference<any> ? boolean :
      never
  }

  /**
   * Table name.
   */
  table?: string

  /**
   * Model properties.
   */
  model: {
    [P in keyof T]?: EntitySchemaProperty<T[P]>
  }

}

export class ModelEntity<B extends Blueprint> {
  constructor(public model: Model<B>,
              public schema: EntitySchema<B>) {
  }
}

export function entity<T extends Blueprint>(model: Model<T>, schema: EntitySchema<T>) {
  return new ModelEntity(model, schema)
}

