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
} from "@microframework/core"
import {Request} from "express";
import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
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
        const propertyResolver = resolver.schema[property]
        resolve = async (parent: any, args: any, context: any, info: any) => {
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

          // perform args validation
          if (TypeCheckers.isBlueprintArgs(value)) {
            await validate(this.app, value.argsType, args)
          }
          
          if (propertyResolver instanceof Function) {
            return this
              .resolveContextOptions({ request: context.request })
              .then(context => {
              // for root queries we don't need to send a parent
              if (name === "Mutation" || name === "Query") {
                if (TypeCheckers.isBlueprintArgs(value)) {
                  return propertyResolver(args, context)
                } else {
                  return propertyResolver(context)
                }
              } else {
                if (TypeCheckers.isBlueprintArgs(value)) {
                  return propertyResolver(parent, args, context)
                } else {
                  return propertyResolver(parent, context)
                }
              }
            })
            .then(async returnedValue => {
              // console.log("validating model", returnedValue, blueprint)
              await validate(this.app, value, returnedValue)
              return returnedValue
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

          } else {
            try {
              const returnedValue = propertyResolver
              await validate(this.app, value, returnedValue)
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
                .resolveContextOptions({ request: context.request })
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
        if (this.app.hasEntity(name)) {
          const entity = this.app.findEntity(name)
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
    }

    // create a new type and return it back
    const newType = new GraphQLObjectType({
      name,
      fields
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

  resolveAnyInput(anyInput: AnyInput | BlueprintPrimitiveProperty, root: boolean = false):
    | GraphQLScalarType
    | GraphQLInputObjectType
    | GraphQLList<any>
  {
    if (anyInput === String) {
      return GraphQLString

    } else if (anyInput === Number) { // todo: need to design floats separately
      return GraphQLInt

    } else if (anyInput === Boolean) {
      return GraphQLBoolean

    } else if (TypeCheckers.isInputArray(anyInput)) {
      return GraphQLList(this.resolveAnyInput(anyInput.option))

    } else if (TypeCheckers.isInputReference(anyInput)) {
      const input = this.inputs.find(input => input.name === anyInput.name)
      if (!input)
        throw new Error(`Input ${anyInput.name} was not found, check your input reference`)

      return this.takeGraphQLInput(input.name, input.blueprint, root)

    } else if (TypeCheckers.isInput(anyInput)) {
      return this.takeGraphQLInput(anyInput.name, anyInput.blueprint, root)

    } else if (TypeCheckers.isInputBlueprint(anyInput)) {
      return this.takeGraphQLInput(Utils.generateRandomString(10), anyInput, root)
    }

    // todo: think about: optional, nullable, selection
    throw new TypeError(`Cannot resolve type, wrong value given ${anyInput}`)
  }

  resolveAnyBlueprint(anyBlueprint: AnyBlueprint):
    | GraphQLScalarType
    | GraphQLObjectType
    | GraphQLList<any>
  {
    if (anyBlueprint === String) {
      return GraphQLString

    } else if (anyBlueprint === Number) { // todo: need to design floats separately
      return GraphQLInt

    } else if (anyBlueprint === Boolean) {
      return GraphQLBoolean

    } else if (TypeCheckers.isBlueprintArray(anyBlueprint)) {
      return GraphQLList(this.resolveAnyBlueprint(anyBlueprint.option))

      // } else if (TypeCheckers.isBlueprintArgs(anyBlueprint)) {
      //   return this.takeGraphQLType(this.resolveAnyBlueprint(anyBlueprint), model.blueprint)

      // } else if (TypeCheckers.isBlueprintOptional(anyBlueprint)) {
      //   return GraphQLNonNull

    } else if (TypeCheckers.isModelReference(anyBlueprint)) {
      const model = this.models.find(model => model.name === anyBlueprint.name)
      if (!model)
        throw new Error(`Model ${anyBlueprint.name} was not found, check your model reference`)

      return this.takeGraphQLType(model.name, model.blueprint)

    } else if (TypeCheckers.isModel(anyBlueprint)) {
      return this.takeGraphQLType(anyBlueprint.name, anyBlueprint.blueprint)

    } else if (TypeCheckers.isBlueprint(anyBlueprint)) {
      return this.takeGraphQLType(Utils.generateRandomString(10), anyBlueprint)

    }

    // todo: think about: optional, nullable, selection
    throw new TypeError(`Cannot resolve type, wrong value given ${anyBlueprint}`)
  }

  /**
   * Resolves context value.
   */
  private async resolveContextOptions(options: { request: Request }) {
    let resolvedContext: { [key: string]: any } = {
      // we can define default framework context variables here
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
