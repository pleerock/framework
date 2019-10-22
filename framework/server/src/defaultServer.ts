import {AnyApplicationOptions, Application, ContextList, ModelResolverSchema} from "@microframework/core";
import {AnyApplication} from "@microframework/core";
import {ActionResolverFn, SubscriptionResolverFn} from "@microframework/core";
import cors from "cors"
import {Request, Response} from "express";
import {GraphQLError, GraphQLSchema, GraphQLSchemaConfig} from "graphql";
import {withFilter} from "graphql-subscriptions";
import {DefaultServerOptions} from "./DefaultServerOptions";
import {generateEntityResolvers} from "./generateEntityResolvers";
import {GraphQLResolver, GraphqlTypeRegistry} from "./index";
import {SubscriptionServer} from "subscriptions-transport-ws";
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';

const express = require("express")
const graphqlHTTP = require("express-graphql")

export const defaultServer = <Context extends ContextList>(
  app: Application<any, any, any, any, any, any, Context>,
  serverOptions: DefaultServerOptions<Context>
) => {
  return async (options: AnyApplicationOptions) => {

    let queryResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .resolvers
      .filter(resolver => resolver.type === "query")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    let mutationResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .resolvers
      .filter(resolver => resolver.type === "mutation")
      .reduce((schema, resolver) => {
        return { ...schema, [resolver.name]: resolver.resolverFn! }
      }, {})

    let subscriptionResolverSchema: ModelResolverSchema<any, any> = app
      .properties
      .resolvers
      .reduce((schema, resolver) => {
        if (resolver.type !== "subscription")
          return schema
        if (!serverOptions.pubSub)
          throw new Error("PubSub isn't registered!")

        const resolverFn = resolver.resolverFn as SubscriptionResolverFn<any, any>
        if (resolverFn.filter) {
          return {
            ...schema,
            [resolver.name]: {
              subscribe: withFilter(
                () => serverOptions.pubSub!.asyncIterator(resolverFn.triggers),
                resolverFn.filter
              )
            }
          }

        } else {
          return {
            ...schema,
            [resolver.name]: {
              subscribe: () => serverOptions.pubSub!.asyncIterator(resolverFn.triggers),
            }
          }
        }
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
      .resolvers
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

    if (Object.keys(subscriptionResolverSchema).length > 0) {
      resolvers.push({
        name: "Subscription",
        schema: subscriptionResolverSchema,
        dataLoaderSchema: {}
      })
    }

    const queries = {
      ...(options.queries || {}),
      ...result.queryDeclarations,
    }

    const mutations = {
      ...(options.mutations || {}),
      ...result.mutationDeclarations,
    }

    const subscriptions = {
      ...(options.subscriptions || {}),
    }

    // create and setup express server
    const expressApp = serverOptions.express || express()
    if (serverOptions.cors === true) {
      expressApp.use(cors())
    } else if (serverOptions.cors instanceof Object) {
      expressApp.use(cors(serverOptions.cors))
    }

    // setip graphql
    if (Object.keys(queries).length || Object.keys(mutations).length) {
      const typeRegistry = new GraphqlTypeRegistry({
        app,
        resolvers,
      })

      let config: GraphQLSchemaConfig = {
        types: typeRegistry.types,
        query: undefined
      }
      if (Object.keys(queries).length > 0) {
        config.query = typeRegistry.takeGraphQLType("Query", queries)
      }
      if (Object.keys(mutations).length > 0) {
        config.mutation = typeRegistry.takeGraphQLType("Mutation", mutations)
      }
      if (Object.keys(subscriptions).length > 0) {
        config.mutation = typeRegistry.takeGraphQLType("Subscription", mutations)
      }

      const schema = new GraphQLSchema(config)

      expressApp.use(
        serverOptions.route || "/graphql",
        graphqlHTTP((request: any, _response: any) => ({
          schema: schema,
          graphiql: serverOptions.graphiql || false,
          context: {
            request: request
          },
          customFormatErrorFn: (error: GraphQLError) => ({
            ...error,
            trace: process.env.NODE_ENV !== "production" ? error.stack : null
          })
        })),
      )

      // setup playground
      if (serverOptions.playground) {
        const expressPlayground = require('graphql-playground-middleware-express').default
        expressApp.get('/playground', expressPlayground({
          endpoint: serverOptions.route || "/graphql",
          subscriptionsEndpoint: `ws://localhost:${serverOptions.websocketPort}/${serverOptions.subscriptionsRoute || "subscriptions"}`
        }))
      }

      // run websocket server
      if (serverOptions.websocketPort) {

        const websocketServer = createServer((request, response) => {
          response.writeHead(404);
          response.end();
        })
        websocketServer.listen(serverOptions.websocketPort, () => {})

        new SubscriptionServer(
          { schema, execute, subscribe },
          { server: websocketServer, path: '/' + (serverOptions.subscriptionsRoute || "subscriptions") },
        );
      }
    }

    // register actions in the express
    for (let manager of app.properties.actionManagers) {
      expressApp[manager.action.type](manager.name, async (request: Request, response: Response, next: any) => {
        app.properties.logger.resolveAction({
          app,
          route: manager.name,
          method: manager.action.type,
          request
        })
        const resolver = app.properties.resolvers.find(resolver => resolver.type === "action" && resolver.name === manager.name)
        const context = await resolveContextOptions(app, { request })
        const result = (resolver!.resolverFn as ActionResolverFn<any, any>)({
          params: request.params,
          query: request.query,
          header: request.header,
          cookies: request.cookies,
          body: request.body,
        }, context)
        try {
          if (result instanceof Promise) {
            return result
              .then(result => {
                app.properties.logger.logActionResponse({
                  app,
                  route: manager.name,
                  method: manager.action.type,
                  content: result,
                  request
                })
                return result
              })
              .then(result => response.json(result))
              .catch(error => {
                app.properties.logger.resolveActionError({
                  app,
                  route: manager.name,
                  method: manager.action.type,
                  error,
                  request
                })
                return app.properties.errorHandler.actionError({
                  app,
                  route: manager.name,
                  method: manager.action.type,
                  error,
                  request,
                  response
                })
              })
          } else {
            app.properties.logger.logActionResponse({
              app,
              route: manager.name,
              method: manager.action.type,
              content: result,
              request
            })
            response.json(result)
          } // think about text responses, status, etc.

        } catch (error) {
          app.properties.logger.resolveActionError({
            app,
            route: manager.name,
            method: manager.action.type,
            error,
            request
          })
          return app.properties.errorHandler.actionError({
            app,
            route: manager.name,
            method: manager.action.type,
            error,
            request,
            response
          })
        }
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
