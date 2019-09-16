import {GraphQLResolver, GraphqlTypeRegistry} from "../graphql/graphql-schema-generator";
import {GraphQLSchema} from "graphql";
import {Connection, createConnection, EntitySchema as TypeormEntitySchema, EntitySchemaColumnOptions} from "typeorm";
import {
  AnyApplicationOptions,
  Application,
  ContextList,
  Model,
  ModelReference,
  ModelResolverSchema,
  args,
  TypeCheckers,
  array,
  AnyBlueprint
} from "@framework/core";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {EntitySchemaRelationOptions, ModelEntity, RelationTypes} from "../entities";
import cors from "cors"
import {InputValidator, ModelValidator} from "@framework/core";

const express = require("express")
const graphqlHTTP = require("express-graphql")

export const defaultServer = <Context extends ContextList>(
  app: Application<any, any, any, any, Context>,
  bootstrapOptions: DefaultServerOptions<Context>
) => {
  return async (options: AnyApplicationOptions) => {

    const models = Object
      .keys(options.models)
      .map(key => options.models[key])

    const inputs = Object
      .keys(options.inputs)
      .map(key => options.inputs[key])

    const queryResolverSchema: ModelResolverSchema<any, any> = bootstrapOptions.resolvers
      .filter(resolver => resolver.type === "query")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    const mutationResolverSchema: ModelResolverSchema<any, any> = bootstrapOptions.resolvers
      .filter(resolver => resolver.type === "mutation")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    for (const model of models) {
      const entity = bootstrapOptions.entities!.find(entity => entity.model === model)
      if (!entity)
        throw new Error(`No entity was found`)

      const entityMetadata = bootstrapOptions.typeormConnection!.entityMetadatas.find(metadata => metadata.name === model.name)
      if (!entityMetadata)
        throw new Error(`No entity metadata was found`)
        
      queryResolverSchema["_model_" + model.name + "_one"] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        return await bootstrapOptions
          .typeormConnection!
          .getRepository(entityMetadata.name)
          .findOne({ where: args.where })
      }
        
      queryResolverSchema["_model_" + model.name + "_many"] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        return bootstrapOptions
          .typeormConnection!
          .getRepository(entityMetadata.name)
          .find({ where: args.where, order: args.order })
      }
        
      queryResolverSchema["_model_" + model.name + "_count"] = async (args: any) => {
        args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
        const count = await bootstrapOptions
          .typeormConnection!
          .getRepository(entityMetadata.name)
          .count(args.where)
          return { count }
      }
        
      mutationResolverSchema["_model_" + model.name + "_save"] = async (input: any) => {
        return bootstrapOptions
          .typeormConnection!
          .getRepository(entityMetadata.name)
          .save(input)
      }
        
      mutationResolverSchema["_model_" + model.name + "_remove"] = async (args: any) => {
        await bootstrapOptions
          .typeormConnection!
          .getRepository(entityMetadata.name)
          .remove(args)
          return { status: "ok" }
      }
    }

    const resolvers: GraphQLResolver[] = bootstrapOptions.resolvers
      .filter(resolver => resolver.type === "model")
      .map(resolver => {
        return {
          name: resolver.name,
          schema: resolver.schema || {},
          dataLoaderSchema: resolver.dataLoaderSchema || {}
        }
      })

    resolvers.push({
      name: "Query",
      schema: queryResolverSchema,
      dataLoaderSchema: {}
    })
    resolvers.push({
      name: "Mutation",
      schema: mutationResolverSchema,
      dataLoaderSchema: {}
    })

    const modelValidators: ModelValidator<any>[] = (bootstrapOptions.validators || []).filter(validator => {
      return validator instanceof ModelValidator
    }) as any[] // todo: any[] is temporary
    const inputValidators: InputValidator<any>[] = (bootstrapOptions.validators || []).filter(validator => {
      return validator instanceof InputValidator
    }) as any[] // todo: any[] is temporary

    const typeRegistry = new GraphqlTypeRegistry({
      app,
      contextResolver: bootstrapOptions.context || {},
      entities: bootstrapOptions.entities || [],
      typeormConnection: bootstrapOptions.typeormConnection,
      models,
      inputs,
      resolvers,
      modelValidators,
      inputValidators,
    })

    const queries = {
      ...options.queries,
    }

    const mutations = {
      ...options.mutations,
    }

    const createModelFromBlueprint = (anyBlueprint: AnyBlueprint): any => {

      if (TypeCheckers.isBlueprintPrimitiveProperty(anyBlueprint)) {
        return anyBlueprint

      } else if (TypeCheckers.isModel(anyBlueprint)) {
        return createModelFromBlueprint(anyBlueprint.blueprint)

      } else if (TypeCheckers.isModelReference(anyBlueprint)) {
        return createModelFromBlueprint(anyBlueprint.blueprint)

      } else if (TypeCheckers.isBlueprintArgs(anyBlueprint)) {
        return createModelFromBlueprint(anyBlueprint.valueType)

      } else if (TypeCheckers.isBlueprintArray(anyBlueprint)) {
        return createModelFromBlueprint(anyBlueprint.option)

      } else if (TypeCheckers.isBlueprint(anyBlueprint)) {
        const whereArgs: any = {}
        for (const key in anyBlueprint) {
          whereArgs[key] = createModelFromBlueprint(anyBlueprint[key])
        }
        return whereArgs
      }

    }

    for (const model of models) {
      const whereArgs = createModelFromBlueprint(model)

      const orderArgs: any = {}
      for (const key in model.blueprint) {
        if (TypeCheckers.isBlueprintPrimitiveProperty(model.blueprint[key])) { // todo: yeah make it more complex like with where
          orderArgs[key] = String // we need to do enum and specify DESC and ASC
        }
      }
      
      queries["_model_" + model.name + "_one"] = args(model, {
        where: whereArgs,
        order: orderArgs,
      })
      queries["_model_" + model.name + "_many"] = args(array(model), {
        where: whereArgs,
        order: orderArgs,
      })
      queries["_model_" + model.name + "_count"] = args({ count: Number }, {
        where: whereArgs,
        // order: orderArgs,
      })

      mutations["_model_" + model.name + "_save"] = args(model, whereArgs)
      mutations["_model_" + model.name + "_remove"] = args({ status: String }, whereArgs)
    }

    const schema = new GraphQLSchema({
      types: typeRegistry.types,
      query: typeRegistry.takeGraphQLType("Query", queries),
      mutation: typeRegistry.takeGraphQLType("Mutation", mutations),
    })

    const expressApp = bootstrapOptions.express || express()
    expressApp.use(cors())
    expressApp.use(
      bootstrapOptions.route || "/graphql",
      graphqlHTTP((request: any, _response: any) => ({
        schema: schema,
        graphiql: true,
        context: {
          request: request
        }
      })),
    )
    expressApp.listen(bootstrapOptions.port)
  }
}

export function createTypeormEntities(app: Application<any, any, any, any, any>, entities: ModelEntity<any>[]) {

  function isColumnInEntitySchema(property: any): property is EntitySchemaColumnOptions {
    return property.type !== undefined
  }

  function isRelationInEntitySchema(property: any): property is EntitySchemaRelationOptions {
    return property.relation !== undefined
  }

  const allModels = Object.keys(app.options.models).map(key => app.options.models[key])

  return entities.map(entity => {
    const model = allModels.find(model => model === entity.model)
    if (!model)
      throw new Error(`Cannot find model ${entity.model} for a given entity`)

    return new TypeormEntitySchema({
      name: model.name,
      tableName: entity.schema.table,
      columns: Object.keys(entity.schema!.model).reduce((columns, key) => {
        const options = entity.schema!.model[key]!
        if (isColumnInEntitySchema(options)) {
          return {
            ...columns,
            [key]: options
          }
        }

        return columns
      }, {}),
      relations: Object.keys(entity.schema!.model).reduce((relations, key) => {
        const options = entity.schema!.model[key]!
        if (isRelationInEntitySchema(options)) {
          let relationType: string|false = false
          if (options.relation === RelationTypes.OneToOne) {
            relationType = "one-to-one"
          } else if (options.relation === RelationTypes.OneToMany) {
            relationType = "one-to-many"
          } else if (options.relation === RelationTypes.ManyToOne) {
            relationType = "many-to-one"
          } else if (options.relation === RelationTypes.ManyToMany) {
            relationType = "many-to-many"
          }

          let target = ""
          const modelPropertyBlueprint = model.blueprint[key]
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
    })
  })
}
