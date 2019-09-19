import {
  AnyApplicationOptions,
  AnyBlueprint,
  Application,
  args,
  array,
  ContextList,
  ModelResolverSchema,
  TypeCheckers
} from "@microframework/core";
import cors from "cors"
import {GraphQLSchema} from "graphql";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {GraphQLResolver, GraphqlTypeRegistry} from "./index";

const express = require("express")
const graphqlHTTP = require("express-graphql")

export const defaultServer = <Context extends ContextList>(
  app: Application<any, any, any, any, Context>,
  serverOptions: DefaultServerOptions<Context>
) => {
  return async (options: AnyApplicationOptions) => {

    const models = Object
      .keys(options.models)
      .map(key => options.models[key])

    const inputs = Object
      .keys(options.inputs)
      .map(key => options.inputs[key])

    const queryResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .declarationManagers
      .map(manager => manager.resolvers)
      .reduce((allResolvers, resolver) => [...allResolvers, ...resolver], [])
      .filter(resolver => resolver.type === "query")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    const mutationResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .declarationManagers
      .map(manager => manager.resolvers)
      .reduce((allResolvers, resolver) => [...allResolvers, ...resolver], [])
      .filter(resolver => resolver.type === "mutation")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    // if db connection was established - auto-generate endpoints for models
    if (app.properties.dataSource) {
      for (const model of models) {
        if (app.hasEntity(model) === false)
          continue

        const entityMetadata = app.properties.dataSource.getMetadata(model.name)

        queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.one(model.name)] = async (args: any) => {
          args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
          return await app
            .properties
            .dataSource!
            .getRepository(entityMetadata.name)
            .findOne({ where: args.where })
        }

        queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.many(model.name)] = async (args: any) => {
          args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
          return app.properties.dataSource!
            .getRepository(entityMetadata.name)
            .find({ where: args.where, order: args.order })
        }

        queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.count(model.name)] = async (args: any) => {
          args = JSON.parse(JSON.stringify(args)) // temporary fix for args being typeof object but not instanceof Object
          const count = await app.properties.dataSource!
            .getRepository(entityMetadata.name)
            .count(args.where)
          return { count }
        }

        queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.save(model.name)] = async (input: any) => {
          return app.properties.dataSource!
            .getRepository(entityMetadata.name)
            .save(input)
        }

        queryResolverSchema[app.properties.namingStrategy.generatedModelDeclarations.remove(model.name)] = async (args: any) => {
          await app.properties.dataSource!
            .getRepository(entityMetadata.name)
            .remove(args)
          return { status: "ok" }
        }
      }
    }

    const resolvers: GraphQLResolver[] = app
      .properties
      .modelManagers
      .map(manager => manager.resolvers)
      .reduce((allResolvers, resolver) => [...allResolvers, ...resolver], [])
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
      models,
      inputs,
      resolvers,
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
      
      queries[app.properties.namingStrategy.generatedModelDeclarations.one(model.name)] = args(model, {
        where: whereArgs,
        order: orderArgs,
      })
      queries[app.properties.namingStrategy.generatedModelDeclarations.many(model.name)] = args(array(model), {
        where: whereArgs,
        order: orderArgs,
      })
      queries[app.properties.namingStrategy.generatedModelDeclarations.count(model.name)] = args({ count: Number }, {
        where: whereArgs,
        // order: orderArgs,
      })

      mutations[app.properties.namingStrategy.generatedModelDeclarations.save(model.name)] = args(model, whereArgs)
      mutations[app.properties.namingStrategy.generatedModelDeclarations.remove(model.name)] = args({ status: String }, whereArgs)
    }

    const schema = new GraphQLSchema({
      types: typeRegistry.types,
      query: typeRegistry.takeGraphQLType("Query", queries),
      mutation: typeRegistry.takeGraphQLType("Mutation", mutations),
    })

    // create and setup express server
    const expressApp = serverOptions.express || express()
    if (serverOptions.cors === true) {
      expressApp.use(cors())
    } else if (serverOptions.cors instanceof Object) {
      expressApp.use(cors(serverOptions.cors))
    }
    expressApp.use(
      serverOptions.route || "/graphql",
      graphqlHTTP((request: any, _response: any) => ({
        schema: schema,
        graphiql: serverOptions.graphiql || false,
        context: {
          request: request
        }
      })),
    )
    expressApp.listen(serverOptions.port)
  }
}
