import {AnyApplicationOptions, Application, ContextList, ModelResolverSchema} from "@microframework/core";
import {AnyApplication} from "@microframework/core/_";
import cors from "cors"
import {Request, Response} from "express";
import {GraphQLSchema} from "graphql";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {generateEntityResolvers} from "./generateEntityResolvers";
import {GraphQLResolver, GraphqlTypeRegistry} from "./index";

const express = require("express")
const graphqlHTTP = require("express-graphql")

export const defaultServer = <Context extends ContextList>(
  app: Application<any, any, any, any, any, Context>,
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

    // register actions in the express
    for (let manager of app.properties.actionManagers) {
      expressApp[manager.action.type](manager.name, async (request: Request, response: Response, next: any) => {
        const resolver = manager.resolvers[0] // todo: think what we shall do with multiple resolvers
        const context = await resolveContextOptions(app, { request })
        const result = resolver!.resolverFn!({
          params: request.params,
          query: request.query,
          header: request.header,
          cookies: request.cookies,
          body: request.body,
        }, context)
        if (result instanceof Promise) {
          return result.then(() => response.json(result))
        } else {
          response.json(result)
        } // think about text responses, status, etc.
      })
    }

    expressApp.listen(serverOptions.port)
  }
}

/**
 * Resolves context value.
 */
async function resolveContextOptions(app: AnyApplication, options: { request: Request }) {
  let resolvedContext: { [key: string]: any } = {
    // we can define default framework context variables here
  }
  for (const key in app.properties.context) {
    const contextResolverItem = app.properties.context[key]
    let result = contextResolverItem instanceof Function ? contextResolverItem(options) : contextResolverItem
    if (result instanceof Promise) {
      result = await result
    }
    resolvedContext[key] = result
  }
  return resolvedContext
}
