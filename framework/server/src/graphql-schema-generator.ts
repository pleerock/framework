import {
  AnyApplication,
  AnyBlueprint,
  AnyInput,
  Blueprint,
  BlueprintPrimitiveProperty,
  Input,
  InputBlueprint,
  Model,
  TypeCheckers,
  Float,
} from "@microframework/core"
import {Request} from "express";
import {
  GraphQLBoolean,
  GraphQLFieldConfigMap, GraphQLFloat,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList, GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString
} from "graphql";
import {Utils} from "./utils";
import {validate} from "./validator";
import DataLoader = require("dataloader");

export type GraphQLResolver = {
  name: string
  schema: { [key: string]: any }
  dataLoaderSchema: { [key: string]: any }
}

export class GraphqlTypeRegistry {

  app: AnyApplication
  models: Model<any>[]
  inputs: Input<any>[]
  resolvers: GraphQLResolver[]

  types: GraphQLObjectType[] = []
  inputTypes: GraphQLInputObjectType[] = []

  constructor(options: {
    app: AnyApplication
    resolvers: GraphQLResolver[]
  }) {
    this.app = options.app
    this.resolvers = options.resolvers

    this.models = Object
      .keys(this.app.options.models || {})
      .map(key => this.app.options.models[key])

    this.inputs = Object
      .keys(this.app.options.inputs || {})
      .map(key => this.app.options.inputs[key])

    this.models.forEach(model => this.resolveAnyBlueprint(model))
    this.inputs.forEach(input => this.resolveAnyInput(input))
  }

  private handlerError({
    name,
    propertyName,
    parent,
    args,
    context,
    info,
    error,
    request,
  }: {
   name: string
   propertyName: string
   parent: any
   args: any
   context: any
   info: any
   error: any
   request: any
  }) {
    if (name === "Query") {
      this.app.properties.logger.resolveQueryError({
        app: this.app,
        propertyName,
        error,
        args,
        context,
        info,
        request
      })
    } else if (name === "Mutation") {
      this.app.properties.logger.resolveMutationError({
        app: this.app,
        propertyName,
        error,
        args,
        context,
        info,
        request
      })
    } else {
      this.app.properties.logger.resolveModelError({
        app: this.app,
        name,
        propertyName,
        error,
        parent,
        args,
        context,
        info,
        request
      })
    }

    return this.app.properties.errorHandler.resolverError({
      app: this.app,
      name,
      error,
      propertyName,
      parent,
      args,
      context,
      info,
      request
    })
  }

  /**
   * Creates GraphQLObjectType for the given blueprint with the given name.
   * If such type was already created, it returns its instance.
   */
  takeGraphQLType(name: string, blueprint: Blueprint): GraphQLObjectType {

    // check if we already have a type with such name
    const existType = this.types.find(type => type.name === name)
    if (existType) {
      return existType
    }

    // create a new type and return it back
    const newType = new GraphQLObjectType({
      name,
      fields: () => {

        // if we don't have such type yet, create a new one
        // start with creating type fields
        const fields: GraphQLFieldConfigMap<any, any> = {}
        // console.log(blueprint)
        for (const property in blueprint) {
          const value = blueprint[property]
          let resolve: any = undefined

          // check if we have a resolver defined for this model and property
          const resolver = this.resolvers.find(resolver => {
            return resolver.name === name && resolver.schema[property] !== undefined
          })
          if (resolver) {
            const propertyResolver = name !== "Subscription" ? resolver.schema[property] : undefined

            resolve = async (parent: any, args: any, context: any, info: any) => {
              try {
                if (name === "Query") {
                  this.app.properties.logger.resolveQuery({
                    app: this.app,
                    propertyName: property,
                    args,
                    context,
                    info,
                    request: context.request
                  })

                } else if (name === "Mutation") {
                  this.app.properties.logger.resolveMutation({
                    app: this.app,
                    propertyName: property,
                    args,
                    context,
                    info,
                    request: context.request
                  })
                } else {
                  this.app.properties.logger.resolveModel({
                    app: this.app,
                    name: name,
                    propertyName: property,
                    parent,
                    args,
                    context,
                    info,
                    request: context.request
                  })
                }

                const userContext = await this.resolveContextOptions({ request: context.request, response: context.response })

                // perform args validation
                if (TypeCheckers.isBlueprintArgs(value)) {
                  await validate(this.app, value.argsType, args, userContext)
                }

                let returnedValue: any
                if (propertyResolver instanceof Function) {
                  // for root queries we don't need to send a parent
                  if (name === "Mutation" || name === "Query") {
                    if (TypeCheckers.isBlueprintArgs(value)) {
                      returnedValue = await propertyResolver(args, userContext)
                    } else {
                      returnedValue = await propertyResolver(userContext)
                    }
                  } else {
                    if (TypeCheckers.isBlueprintArgs(value)) {
                      returnedValue = await propertyResolver(parent, args, userContext)
                    } else {
                      returnedValue = await propertyResolver(parent, userContext)
                    }
                  }
                  // console.log("validating model", returnedValue, blueprint)
                  await validate(this.app, value, returnedValue, userContext)

                } else {
                  returnedValue = propertyResolver
                  await validate(this.app, value, returnedValue, context)
                }

                this.app.properties.logger.logGraphQLResponse({
                  app: this.app,
                  name,
                  propertyName: property,
                  content: returnedValue,
                  parent,
                  args,
                  context,
                  info,
                  request: context.request
                })
                return returnedValue

              } catch (error) {
                this.handlerError({
                  name,
                  propertyName: property,
                  error,
                  parent,
                  args,
                  context,
                  info,
                  request: context.request
                })
                throw error
              }
            }
          }

          // check if we have a resolver defined for this model and property
          const dataLoaderResolver = this.resolvers.find(resolver => {
            return resolver.name === name && resolver.dataLoaderSchema[property] !== undefined
          })
          if (/*!resolve && */dataLoaderResolver) {
            const propertyResolver = dataLoaderResolver.dataLoaderSchema[property]
            resolve = (parent: any, args: any, context: any, info: any) => {
              this.app.properties.logger.resolveModel({
                app: this.app,
                name: name,
                propertyName: property,
                parent,
                args,
                context,
                info,
                request: context.request
              })

              if (!context.dataLoaders)
                context.dataLoaders = {};
              if (!context.dataLoaders[name])
                context.dataLoaders[name] = {};

              // define data loader for this method if it was not defined yet
              if (!context.dataLoaders[name][property]) {
                context.dataLoaders[name][property] = new DataLoader((keys: { parent: any, args: any, context: any, info: any }[]) => {
                  const entities = keys.map(key => key.parent)

                  if (!(propertyResolver instanceof Function))
                    return propertyResolver

                  return this
                    .resolveContextOptions({ request: context.request, response: context.response })
                    .then(context => {
                      // for root queries we don't need to send a parent
                      if (name === "Mutation" || name === "Query") {
                        throw new Error(`Data loader isn't supported for root queries and mutations`)
                      } else {
                        if (TypeCheckers.isBlueprintArgs(value)) {
                          return propertyResolver(entities, keys[0].args, context) // keys[0].info
                        } else {
                          return propertyResolver(entities, context) // keys[0].info
                        }
                      }
                    })
                    .then(result => {
                      this.app.properties.logger.logGraphQLResponse({
                        app: this.app,
                        name,
                        propertyName: property,
                        content: result,
                        parent,
                        args,
                        context,
                        info,
                        request: context.request
                      })
                      return result
                    })
                    .catch(error => this.handlerError({
                      name,
                      propertyName: property,
                      error,
                      parent,
                      args,
                      context,
                      info,
                      request: context.request
                    }))
                }, {
                  cacheKeyFn: (key: { parent: any, args: any, context: any, info: any }) => {
                    return JSON.stringify({ parent: key.parent, args: key.args });
                  }
                })
              }

              return context.dataLoaders[name][property].load({ parent, args, context, info })
            }
          }

          // if no resolver is defined check if we this model has entity and check if this entity property must be resolved
          if (!resolve && this.app.properties.dataSource) {
            const entity = this
              .app
              .properties
              .entities
              .find(entity => entity.model.name === name)
            if (entity) {
              const entityMetadata = this.app.properties.dataSource.getMetadata(name)
              if (entity.entityResolveSchema === true || (entity.entityResolveSchema instanceof Object && entity.entityResolveSchema[property] === true)) {
                const entityRelation = entityMetadata.relations.find(relation => relation.propertyName === property)
                if (entityRelation) {
                  resolve = ((parent: any, args: any, context: any, info: any) => {
                    this.app.properties.logger.resolveModel({
                      app: this.app,
                      name: name,
                      propertyName: property,
                      parent,
                      args,
                      context,
                      info,
                      request: context.request
                    })

                    if (!context.dataLoaders)
                      context.dataLoaders = {};
                    if (!context.dataLoaders[name])
                      context.dataLoaders[name] = {};

                    // define data loader for this method if it was not defined yet
                    if (!context.dataLoaders[name][property]) {
                      context.dataLoaders[name][property] = new DataLoader((keys: { parent: any, args: any, context: any, info: any }[]) => {
                        const entities = keys.map(key => key.parent)
                        return this.app.properties.dataSource!
                          .relationIdLoader
                          .loadManyToManyRelationIdsAndGroup(entityRelation, entities)
                          .then(groups => groups.map(group => group.related))
                          .then(result => {
                            this.app.properties.logger.logGraphQLResponse({
                              app: this.app,
                              name,
                              propertyName: property,
                              content: result,
                              parent,
                              args,
                              context,
                              info,
                              request: context.request
                            })
                            return result
                          })
                          .catch(error => this.handlerError({
                            name,
                            propertyName: property,
                            error,
                            parent,
                            args,
                            context,
                            info,
                            request: context.request
                          }) as any)
                      }, {
                        cacheKeyFn: (key: { parent: any, args: any, context: any, info: any }) => {
                          return JSON.stringify({ parent: key.parent, args: key.args });
                        }
                      })
                    }

                    return context.dataLoaders[name][property].load({ parent, args, context, info })
                  })
                }
              }
            }
          }

          if (TypeCheckers.isBlueprintArgs(value)) {
            fields[property] = {
              type: this.resolveAnyBlueprint(value.valueType),
              args: this.resolveAnyInput(value.argsType, true) as any,
              resolve,
            }

          } else {
            fields[property] = {
              type: this.resolveAnyBlueprint(blueprint[property]),
              resolve
            }
          }

          if (name === "Subscription" && resolver) {
            fields[property] = {
              ...fields[property],
              subscribe: resolver.schema[property].subscribe,
              resolve: (val: any) => val, // todo: do we need a logger here?
            }
          }
        }
        return fields
      }
    })
    this.types.push(newType)
    return newType
  }

  /**
   * Creates GraphQLInputObjectType for the given input blueprint with the given name.
   * If such type was already created, it returns its instance.
   */
  takeGraphQLInput(name: string, blueprint: InputBlueprint, root = false): any {

    // check if we already have a type with such name
    const existType = root === false ? this.inputTypes.find(type => type.name === name) : undefined
    if (existType) {
      return existType
    }

    // if we don't have such type yet, create a new one
    // start with creating type fields
    const fields: GraphQLInputFieldConfigMap = {}
    for (const property in blueprint) {
      fields[property] = {
        type: this.resolveAnyInput(blueprint[property]),
      }
    }

    // create a new type and return it back
    if (root === false) {
      const newType = new GraphQLInputObjectType({
        name,
        fields
      })
      this.inputTypes.push(newType)
      return newType
    }

    return fields
  }

  resolveAnyInput(anyInput: AnyInput | BlueprintPrimitiveProperty, root: boolean = false, nullable: boolean = false):
    | GraphQLScalarType
    | GraphQLInputObjectType
    | GraphQLList<any>
  {
    if (anyInput === String) {
      return nullable ? GraphQLString : GraphQLNonNull(GraphQLString)

    } else if (anyInput === Number) {
      return nullable ? GraphQLInt : GraphQLNonNull(GraphQLInt)

    } else if (TypeCheckers.isFloat(anyInput)) {
      return nullable ? GraphQLFloat : GraphQLNonNull(GraphQLFloat)

    } else if (anyInput === Boolean) {
      return nullable ? GraphQLBoolean : GraphQLNonNull(GraphQLBoolean)

    } else if (TypeCheckers.isBlueprintArray(anyInput)) {
      return nullable ? GraphQLList(this.resolveAnyInput(anyInput.option)) : GraphQLNonNull(GraphQLList(this.resolveAnyInput(anyInput.option, false)))

    } else if (TypeCheckers.isBlueprintNullable(anyInput)) {
      return this.resolveAnyInput(anyInput.option, false, true)

    } else if (TypeCheckers.isInputReference(anyInput)) {
      const input = this.inputs.find(input => input.name === anyInput.name)
      if (!input)
        throw new Error(`Input ${anyInput.name} was not found, check your input reference`)

      const type = this.takeGraphQLInput(input.name, input.blueprint, root)
      return type /* nullable ? type : GraphQLNonNull(type) */

    } else if (TypeCheckers.isInput(anyInput)) {
      const type = this.takeGraphQLInput(anyInput.name, anyInput.blueprint, root)
      return type /* nullable ? type : GraphQLNonNull(type) */

    } else if (TypeCheckers.isInputBlueprint(anyInput)) {
      const type = this.takeGraphQLInput(Utils.generateRandomString(10), anyInput, root)
      return type /* nullable ? type : GraphQLNonNull(type) */
    }

    // todo: think about: optional, nullable, selection
    throw new TypeError(`Cannot resolve type, wrong value given ${anyInput}`)
  }

  resolveAnyBlueprint(anyBlueprint: AnyBlueprint, nullable: boolean = false):
    | GraphQLScalarType
    | GraphQLObjectType
    | GraphQLList<any>
  {
    if (anyBlueprint === String) {
      return nullable ? GraphQLString : GraphQLNonNull(GraphQLString)

    } else if (anyBlueprint === Number) { // todo: need to design floats separately
      return nullable ? GraphQLInt : GraphQLNonNull(GraphQLInt)

    } else if (TypeCheckers.isFloat(anyBlueprint)) {
      return nullable ? GraphQLFloat : GraphQLNonNull(GraphQLFloat)

    } else if (anyBlueprint === Boolean) {
      return nullable ? GraphQLBoolean : GraphQLNonNull(GraphQLBoolean)

    } else if (TypeCheckers.isBlueprintArray(anyBlueprint)) {
      return nullable ? GraphQLList(this.resolveAnyBlueprint(anyBlueprint.option)) : GraphQLNonNull(GraphQLList(this.resolveAnyBlueprint(anyBlueprint.option)))

    } else if (TypeCheckers.isBlueprintNullable(anyBlueprint)) {
      return this.resolveAnyBlueprint(anyBlueprint.option, true)

      // } else if (TypeCheckers.isBlueprintArgs(anyBlueprint)) {
      //   return this.takeGraphQLType(this.resolveAnyBlueprint(anyBlueprint), model.blueprint)

      // } else if (TypeCheckers.isBlueprintNullable(anyBlueprint)) {
      //   return GraphQLNonNull

    } else if (TypeCheckers.isModelReference(anyBlueprint)) {
      const model = this.models.find(model => model.name === anyBlueprint.name)
      if (!model)
        throw new Error(`Model ${anyBlueprint.name} was not found, check your model reference`)

      const type = this.takeGraphQLType(model.name, model.blueprint)
      return nullable ? type : GraphQLNonNull(type)

    } else if (TypeCheckers.isModel(anyBlueprint)) {
      const type = this.takeGraphQLType(anyBlueprint.name, anyBlueprint.blueprint)
      return nullable ? type : GraphQLNonNull(type)

    } else if (TypeCheckers.isBlueprint(anyBlueprint)) {
      const type = this.takeGraphQLType(Utils.generateRandomString(10), anyBlueprint)
      return nullable ? type : GraphQLNonNull(type)

    }

    // todo: think about: optional, nullable, selection
    throw new TypeError(`Cannot resolve type, wrong value given ${anyBlueprint}`)
  }

  /**
   * Resolves context value.
   */
  private async resolveContextOptions(options: { request: Request, response: Response }) {
    let resolvedContext: { [key: string]: any } = {
      // we can define default framework context variables here
      request: options.request,
      response: options.response
    }
    for (const key in this.app.properties.context) {
      const contextResolverItem = this.app.properties.context[key]
      let result = contextResolverItem instanceof Function ? contextResolverItem(options) : contextResolverItem
      if (result instanceof Promise) {
        result = await result
      }
      resolvedContext[key] = result
    }
    return resolvedContext
  }
}
