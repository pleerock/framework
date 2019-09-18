import {Blueprint, BlueprintAnyProperty} from "../types/core";
import {Model, ModelReference} from "../types/operators";
import {EntitySchemaColumnOptions} from "typeorm";

// todo: we can also automatically show ManyToMany and OneToMany options for arrays and OneToOne and ManyToOne options for non arrays
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

// todo: we can also automatically show ManyToMany and OneToMany options for arrays and OneToOne and ManyToOne options for non arrays
export type EntitySchemaProperty<P extends BlueprintAnyProperty> =
  P extends Model<any> ? EntitySchemaRelationOptions :
  P extends ModelReference<any> ? EntitySchemaRelationOptions :
  // P extends Blueprint ? EntitySchemaRelationOptions : // todo: maybe embedded here yaaai
  EntitySchemaColumnOptions


/**
 * Indicates if server must automatically resolve entity properties.
 * If set to true, resolves all properties.
 * Defaults to false.
 *
 * You can also specify list of particular properties you want to automatically resolve.
 */
export type EntityResolveSchema<T extends Blueprint> = boolean | {
  [P in keyof T]?:
    T[P] extends Model<any> ? boolean :
    T[P] extends ModelReference<any> ? boolean :
      never
}

export type EntitySchema<T extends Blueprint> = {
  [P in keyof T]?: EntitySchemaProperty<T[P]>
}
