import {defaultServer} from "@framework/server";
import {PostModelResolver} from "./resolver/PostModelResolver";
import {PostsQueryResolver} from "./resolver/PostsQueryResolver";
import {PostEntity} from "./entity/PostEntity";
import {PostQueryResolver} from "./resolver/PostQueryResolver";
import {PostSaveMutationResolver} from "./resolver/PostSaveMutationResolver";
import {app} from "./app";
import {PostValidator} from "./validator/PostValidator";
import {UserEntity} from "./entity/UserEntity";
import {createConnection} from "typeorm";
import {createTypeormEntities} from "@framework/server";

const entities = [
  PostEntity,
  UserEntity,
]

const resolvers = [
  PostModelResolver,
  PostsQueryResolver,
  PostQueryResolver,
  PostSaveMutationResolver,
]

const validators = [
  PostValidator,
]

const context = {
  currentUser: async () => {
    return {
      id: 1,
      firstName: "Natures",
      lastName: "Prophet",
    }
  }
}

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: createTypeormEntities(app, entities),
  synchronize: true
})
  .then((connection) => {
    return app
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          resolvers: resolvers,
          validators: validators,
          entities: entities,
          typeormConnection: connection,
          context: context
        })
      )
  })
  .then((result) => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })

