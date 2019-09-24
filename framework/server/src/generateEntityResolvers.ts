import {
  AnyApplication,
  AnyBlueprint,
  args,
  array,
  DeclarationBlueprint,
  ModelResolverSchema,
  TypeCheckers,
  nullable
} from "@microframework/core";

/**
 * Transforms entities defined in the app to TypeORM entity format.
 * Should be used to pass app entities to TypeORM connection object.
 */
export function generateEntityResolvers(app: AnyApplication) {
  const queryResolverSchema: ModelResolverSchema<any, any> = {}
  const mutationResolverSchema: ModelResolverSchema<any, any> = {}
  const queryDeclarations: DeclarationBlueprint = {}
  const mutationDeclarations: DeclarationBlueprint = {}

  // if db connection was established - auto-generate endpoints for models
  if (app.properties.dataSource) {
    for (const entity of app.properties.entities) {
      const entityMetadata = app.properties.dataSource.getMetadata(entity.model.name)

      queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.one(entity.model.name)] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        return await app
          .properties
          .dataSource!
          .getRepository(entityMetadata.name)
          .findOne({ where: args.where })
      }

      queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.many(entity.model.name)] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        return app.properties.dataSource!
          .getRepository(entityMetadata.name)
          .find({ where: args.where, order: args.order, take: args.limit, skip: args.offset })
      }

      queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.count(entity.model.name)] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        const count = await app.properties.dataSource!
          .getRepository(entityMetadata.name)
          .count(args.where)
        return { count }
      }

      mutationResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.save(entity.model.name)] = async (input: any) => {
        return app.properties.dataSource!
          .getRepository(entityMetadata.name)
          .save(input)
      }

      mutationResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.remove(entity.model.name)] = async (args: any) => {
        await app.properties.dataSource!
          .getRepository(entityMetadata.name)
          .remove(args)
        return { status: "ok" }
      }

      const whereArgs = createModelFromBlueprint(entity.model)

      const orderArgs: any = {}
      for (const key in entity.model.blueprint) {
        if (TypeCheckers.isBlueprintPrimitiveProperty(entity.model.blueprint[key])) { // todo: yeah make it more complex like with where
          orderArgs[key] = nullable(String) // we need to do enum and specify DESC and ASC
        }
      }

      queryDeclarations[app.properties.namingStrategy.generatedModelDeclarations.one(entity.model.name)] = args(entity.model, {
        where: nullable(whereArgs),
        order: nullable(orderArgs),
      })
      queryDeclarations[app.properties.namingStrategy.generatedModelDeclarations.many(entity.model.name)] = args(array(entity.model), {
        where: nullable(whereArgs),
        order: nullable(orderArgs),
        offset: nullable(Number),
        limit: nullable(Number),
      })
      queryDeclarations[app.properties.namingStrategy.generatedModelDeclarations.count(entity.model.name)] = args({ count: Number }, {
        where: nullable(whereArgs),
        // order: orderArgs,
      })

      mutationDeclarations[app.properties.namingStrategy.generatedModelDeclarations.save(entity.model.name)] = args(entity.model, whereArgs)
      mutationDeclarations[app.properties.namingStrategy.generatedModelDeclarations.remove(entity.model.name)] = args({ status: String }, whereArgs)
    }
  }

  return {
    queryResolverSchema,
    mutationResolverSchema,
    queryDeclarations,
    mutationDeclarations,
  }
}


const createModelFromBlueprint = (anyBlueprint: AnyBlueprint): any => {

  if (TypeCheckers.isBlueprintPrimitiveProperty(anyBlueprint)) {
    return nullable(anyBlueprint)

  } else if (TypeCheckers.isModel(anyBlueprint)) {
    return createModelFromBlueprint(anyBlueprint.blueprint)

  } else if (TypeCheckers.isModelReference(anyBlueprint)) {
    return createModelFromBlueprint(anyBlueprint.blueprint)

  } else if (TypeCheckers.isBlueprintArgs(anyBlueprint)) {
    return createModelFromBlueprint(anyBlueprint.valueType)

  } else if (TypeCheckers.isBlueprintArray(anyBlueprint)) {
    return createModelFromBlueprint(anyBlueprint.option)

  } else if (TypeCheckers.isBlueprintNullable(anyBlueprint)) {
    return createModelFromBlueprint(anyBlueprint.option)

  } else if (TypeCheckers.isBlueprint(anyBlueprint)) {
    const whereArgs: any = {}
    for (const key in anyBlueprint) {
      whereArgs[key] = createModelFromBlueprint(anyBlueprint[key])
    }
    return whereArgs
  }

}
