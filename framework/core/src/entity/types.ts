import {Blueprint, BlueprintAnyProperty} from "../types/core";
import {BlueprintArgs, BlueprintArray, BlueprintNullable, Model, ModelReference} from "../types/operators";
import {EntitySchemaColumnOptions} from "typeorm";

// todo: we can also automatically show ManyToMany and OneToMany options for arrays and OneToOne and ManyToOne options for non arrays
export type EntitySchemaRelationOneOptions = {
  relation: "one-to-one"
  joinColumn: true
  inverseSide?: string
} | {
  relation: "one-to-one"
  joinColumn: false
  inverseSide: string
} | {
  relation: "many-to-one"
  inverseSide?: string
}

export type EntitySchemaRelationArrayOptions = {
  relation: "many-to-many"
  joinTable: false
  inverseSide: string
} | {
  relation: "many-to-many"
  joinTable: true
  inverseSide?: string
} | {
  relation: "one-to-many"
  inverseSide: string
}

// todo: we can also automatically show ManyToMany and OneToMany options for arrays and OneToOne and ManyToOne options for non arrays
export type EntitySchemaProperty<P extends BlueprintAnyProperty> =
  P extends Model<any> ? EntitySchemaRelationOneOptions :
  P extends ModelReference<any> ? EntitySchemaRelationOneOptions :
  P extends BlueprintNullable<Model<any> | ModelReference<any>> ? EntitySchemaRelationOneOptions :
  P extends BlueprintArray<infer I> ? (
    I extends Model<any> ? EntitySchemaRelationArrayOptions :
    I extends ModelReference<any> ? EntitySchemaRelationArrayOptions :
    I extends BlueprintNullable<Model<any> | ModelReference<any>> ? EntitySchemaRelationArrayOptions :
    EntitySchemaColumnOptions
  ) :
  P extends BlueprintArgs<infer V, infer A> ? (
    V extends Model<any> ? EntitySchemaRelationOneOptions :
    V extends ModelReference<any> ? EntitySchemaRelationOneOptions :
    V extends BlueprintNullable<Model<any> | ModelReference<any>> ? EntitySchemaRelationOneOptions :
    V extends BlueprintArray<infer I> ? (
      I extends Model<any> ? EntitySchemaRelationArrayOptions :
      I extends ModelReference<any> ? EntitySchemaRelationArrayOptions :
      I extends BlueprintNullable<Model<any> | ModelReference<any>> ? EntitySchemaRelationArrayOptions :
      EntitySchemaColumnOptions
    ) :
    EntitySchemaColumnOptions
  ) :
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
    T[P] extends BlueprintNullable<Model<any> | ModelReference<any>> ? boolean :
    never
}

export type EntitySchema<T extends Blueprint> = {
  [P in keyof T]?: EntitySchemaProperty<T[P]>
}
