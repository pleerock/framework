import {GraphQLResolver, GraphqlTypeRegistry} from "../graphql/graphql-schema-generator";
import {GraphQLSchema} from "graphql";
import {Connection, createConnection, EntitySchema as TypeormEntitySchema, EntitySchemaColumnOptions} from "typeorm";
import {
  AnyApplicationOptions,
  Application,
  ContextList,
  Model,
  ModelReference,
  ModelResolverSchema
} from "@framework/core";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {EntitySchemaRelationOptions, ModelEntity, RelationTypes} from "../entities";
import cors from "cors"

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


    const typeRegistry = new GraphqlTypeRegistry({
      app,
      contextResolver: bootstrapOptions.context || {},
      entities: bootstrapOptions.entities || [],
      typeormConnection: bootstrapOptions.typeormConnection,
      models,
      inputs,
      resolvers
    })

    const schema = new GraphQLSchema({
      types: typeRegistry.types,
      query: typeRegistry.takeGraphQLType("Query", options.queries),
      mutation: typeRegistry.takeGraphQLType("Mutation", options.mutations),
    })

    const expressApp = bootstrapOptions.express || express()
    expressApp.use(cors())
    expressApp.use(
      bootstrapOptions.route || "/graphql",
      graphqlHTTP({
        schema: schema,
        graphiql: true,
      }),
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
