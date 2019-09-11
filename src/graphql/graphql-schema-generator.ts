import {
  AnyBlueprint,
  AnyInput,
  Application,
  Blueprint, BlueprintArgs,
  ContextList,
  ContextResolver,
  Input,
  InputBlueprint,
  Model, ModelEntity
} from "../app"
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
import {TypeCheckers} from "../util/TypeCheckers";
import {Utils} from "../util/Utils";
import {Connection} from "typeorm";


export type GraphQLResolver = {
  name: string
  schema: { [key: string]: any }
}

export class GraphqlTypeRegistry {

  app: Application<any, any, any, any, any>
  typeormConnection?: Connection
  contextResolver: ContextResolver<ContextList>
  models: Model<any>[]
  inputs: Input<any>[]
  entities: ModelEntity<any>[]
  resolvers: GraphQLResolver[]

  types: GraphQLObjectType[] = []
  inputTypes: GraphQLInputObjectType[] = []

  constructor(options: {
    app: Application<any, any, any, any, any>
    typeormConnection?: Connection
    entities: ModelEntity<any>[]
    contextResolver: ContextResolver<ContextList>
    models: Model<any>[]
    inputs: Input<any>[]
    resolvers: GraphQLResolver[]
  }) {
    this.app = options.app
    this.typeormConnection = options.typeormConnection
    this.contextResolver = options.contextResolver
    this.models = options.models
    this.inputs = options.inputs
    this.entities = options.entities
    this.resolvers = options.resolvers
    this.models.forEach(model => this.resolveAnyBlueprint(model))
    this.inputs.forEach(input => this.resolveAnyInput(input))
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
    for (const property in blueprint) {
      const value = blueprint[property]

      // determine if this property has args
      let hasArgs = false
      if (name === "Mutation") {
        if (this.app.options.mutations.options[property] &&
          this.app.options.mutations.options[property].args !== undefined) {
          hasArgs = true
        }
      } else if (name === "Query") {
        if (this.app.options.queries.options[property] &&
          this.app.options.queries.options[property].args !== undefined) {
          hasArgs = true
        }
      } else {
        hasArgs = TypeCheckers.isBlueprintArgs(value)
      }

      // check if we have a resolver defined for this model and property
      const resolver = this.resolvers.find(resolver => {
        return resolver.name === name && resolver.schema[property] !== undefined
      } )
      // console.log('resolving', name, 'for', property, resolver)
      let resolve = resolver ? (parent: any, args: any) => {
        const propertyResolver = resolver.schema[property]
        if (propertyResolver instanceof Function) {
          const contextPromise = this.resolveContextOptions()
          return contextPromise.then(context => {
            // for root queries we don't need to send a parent
            if (name === "Mutation" || name === "Query") {
              if (hasArgs) {
                return propertyResolver(args, context)
              } else {
                return propertyResolver(context)
              }
            } else {
              if (hasArgs) {
                return propertyResolver(parent, args, context)
              } else {
                return propertyResolver(parent, context)
              }
            }
          })

        } else {
          return propertyResolver
        }
      } : undefined

      // if no resolver is defined check if we this model has entity and check if this entity property must be resolved
      if (!resolve && this.typeormConnection) {
        const entity = this.entities.find(entity => entity.model.name === name)
        const entityMetadata = this.typeormConnection.entityMetadatas.find(metadata => metadata.name === name)
        if (entity && entityMetadata) {
          if (entity.schema.resolve === true || (entity.schema.resolve instanceof Object && entity.schema.resolve[property] === true)) {
            const entityRelation = entityMetadata.relations.find(relation => relation.propertyName === property)
            if (entityRelation) {
              resolve = (parent => {
                return this.typeormConnection!
                  .relationIdLoader
                  .loadManyToManyRelationIdsAndGroup(entityRelation, [parent]) // todo: send all entities when data loader will be implemented
                  .then(groups => groups.map(group => group.related))
                  .then(result => result[0]) // todo: need it here until data loader is implemented
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

  resolveAnyInput(anyInput: AnyInput, root: boolean = false):
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
  private async resolveContextOptions() {
    let resolvedContext: { [key: string]: any } = {}
    for (const key in this.contextResolver) {
      const contextResolverItem = this.contextResolver[key]
      let result = contextResolverItem instanceof Function ? contextResolverItem() : contextResolverItem
      if (result instanceof Promise) {
        result = await result
      }
      resolvedContext[key] = result
    }
    return resolvedContext
  }
}
