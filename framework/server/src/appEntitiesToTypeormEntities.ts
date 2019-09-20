import {AnyApplication, EntitySchemaRelationOptions, Model, ModelReference} from "@microframework/core";
import {EntitySchema as TypeormEntitySchema, EntitySchemaColumnOptions} from "typeorm";

/**
 * Transforms entities defined in the app to TypeORM entity format.
 * Should be used to pass app entities to TypeORM connection object.
 */
export function appEntitiesToTypeormEntities(app: AnyApplication) {
  return app.properties.entities.map(entity => {

    const columns = Object.keys(entity.entitySchema!).reduce((columns, key) => {
      const options = entity.entitySchema![key]!
      if (isColumnInEntitySchema(options)) {
        return {
          ...columns,
          [key]: options
        }
      }
      return columns
    }, {})

    const relations = Object.keys(entity.entitySchema!).reduce((relations, key) => {
      const options = entity.entitySchema![key]!
      if (isRelationInEntitySchema(options)) {
        let relationType = options.relation

        let target = ""
        const modelPropertyBlueprint = entity.model.blueprint[key]
        if (modelPropertyBlueprint instanceof Model) {
          target = modelPropertyBlueprint.name
        } else if (modelPropertyBlueprint instanceof ModelReference) {
          target = modelPropertyBlueprint.name
        }
        return {
          ...relations,
          [key]: {
            target: target,
            type: relationType,
            inverseSide: (options as { inverseSide: string }).inverseSide,
            joinColumn: (options as { joinColumn: boolean }).joinColumn,
            joinTable: (options as { joinTable: boolean }).joinTable,
          }
        }
      }
      return relations
    }, {})

    return new TypeormEntitySchema({
      name: entity.model.name,
      tableName: entity.tableName,
      columns,
      relations,
    })
  })
}

function isColumnInEntitySchema(property: any): property is EntitySchemaColumnOptions {
  return property.type !== undefined
}

function isRelationInEntitySchema(property: any): property is EntitySchemaRelationOptions {
  return property.relation !== undefined
}