import {AnyApplicationOptions, Application, ContextList, ModelResolverSchema} from "@microframework/core";
import cors from "cors"
import {GraphQLSchema} from "graphql";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {generateEntityResolvers} from "./generateEntityResolvers";
import {GraphQLResolver, GraphqlTypeRegistry} from "./index";

const express = require("express")
const graphqlHTTP = require("express-graphql")

export const defaultServer = <Context extends ContextList>(
  app: Application<any, any, any, any, Context>,
  serverOptions: DefaultServerOptions<Context>
) => {
  return async (options: AnyApplicationOptions) => {

    let queryResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .declarationManagers
      .map(manager => manager.resolvers)
      .reduce((allResolvers, resolver) => [...allResolvers, ...resolver], [])
      .filter(resolver => resolver.type === "query")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    let mutationResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .declarationManagers
      .map(manager => manager.resolvers)
      .reduce((allResolvers, resolver) => [...allResolvers, ...resolver], [])
      .filter(resolver => resolver.type === "mutation")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    const result = generateEntityResolvers(app)

    queryResolverSchema = {
      ...queryResolverSchema,
      ...result.queryResolverSchema,
    }

    mutationResolverSchema = {
      ...mutationResolverSchema,
      ...result.mutationResolverSchema,
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
      resolvers,
    })

    const queries = {
      ...options.queries,
      ...result.queryDeclarations,
    }

    const mutations = {
      ...options.mutations,
      ...result.mutationDeclarations,
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
