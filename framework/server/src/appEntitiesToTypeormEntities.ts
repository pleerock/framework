import {EntitySchemaRelationOptions, ModelEntity, TypeCheckers} from "@microframework/core";
import {EntitySchema as TypeormEntitySchema, EntitySchemaColumnOptions} from "typeorm";

/**
 * Transforms entities defined in the app to TypeORM entity format.
 * Should be used to pass app entities to TypeORM connection object.
 */
export function appEntitiesToTypeormEntities(entitiesOrMap: ModelEntity<any>[] | { [key: string]: ModelEntity<any> }) {
  const entities = entitiesOrMap instanceof Array ? entitiesOrMap : Object.keys(entitiesOrMap).map(key => entitiesOrMap[key])
  return entities.map(entity => {

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
        if (TypeCheckers.isModel(modelPropertyBlueprint)) {
          target = modelPropertyBlueprint.name
        } else if (TypeCheckers.isModelReference(modelPropertyBlueprint)) {
          target = modelPropertyBlueprint.name
        } else if (TypeCheckers.isBlueprintNullable(modelPropertyBlueprint)) {
          target = modelPropertyBlueprint.option.name
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
