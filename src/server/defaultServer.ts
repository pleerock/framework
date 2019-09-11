import {Blueprint} from "../app/core";
import {GraphQLResolver, GraphqlTypeRegistry} from "../graphql/graphql-schema-generator";
import {GraphQLSchema} from "graphql";
import {Connection, createConnection, EntitySchema as TypeormEntitySchema, EntitySchemaColumnOptions} from "typeorm";
import {
  AnyApplicationOptions,
  Application,
  args,
  ContextList, EntitySchemaRelationOptions,
  Model, ModelEntity, ModelReference,
  ModelResolverSchema, RelationTypes
} from "../app";
import {DefaultServerOptions} from "./DefaultServerOptions";

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
          schema: resolver.schema!
        }
      })

    resolvers.push({
      name: "Query",
      schema: queryResolverSchema
    })
    resolvers.push({
      name: "Mutation",
      schema: mutationResolverSchema
    })

    let typeormConnection: Connection|undefined = undefined
    if (bootstrapOptions.entities && bootstrapOptions.entities.length) {
      typeormConnection = await createConnection({
        type: "sqlite",
        database: "database.sqlite",
        entities: createTypeormEntities(models, bootstrapOptions.entities),
        synchronize: true
      })
    }

    const typeRegistry = new GraphqlTypeRegistry({
      app,
      contextResolver: bootstrapOptions.context || {},
      entities: bootstrapOptions.entities || [],
      typeormConnection,
      models,
      inputs,
      resolvers
    })

    const queryBlueprint: Blueprint = {}
    for (const name in options.queries.options) {
      const query = options.queries.options[name]
      queryBlueprint[name] = query.args ? args(query.return, query.args) : query.return
    }

    const mutationBlueprint: Blueprint = {}
    for (const name in options.mutations.options) {
      const mutation = options.mutations.options[name]
      mutationBlueprint[name] = mutation.args ? args(mutation.return, mutation.args) : mutation.return
    }

    const schema = new GraphQLSchema({
      types: typeRegistry.types,
      query: typeRegistry.takeGraphQLType("Query", queryBlueprint),
      mutation: typeRegistry.takeGraphQLType("Mutation", mutationBlueprint),
    })

    const expressApp = bootstrapOptions.express || express()
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

export function createTypeormEntities(allModels: Model<any>[], entities: ModelEntity<any>[]) {

  function isColumnInEntitySchema(property: any): property is EntitySchemaColumnOptions {
    return property.type !== undefined
  }

  function isRelationInEntitySchema(property: any): property is EntitySchemaRelationOptions {
    return property.relation !== undefined
  }

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
