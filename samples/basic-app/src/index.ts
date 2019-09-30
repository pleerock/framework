require('dotenv').config()

import {appEntitiesToTypeormEntities, defaultServer} from "@microframework/server";
import {defaultValidator} from "@microframework/validator";
import {debugLogger} from "@microframework/logger";
import {app} from "./app";
import {createConnection} from "typeorm";

import "./entity/PostEntity"
import "./entity/UserEntity"
import "./model/PostModel"
import "./model/UserModel"
import "./resolver/PostModelResolver"
import "./resolver/PostsQueryResolver"
import "./resolver/PostSaveMutationResolver"
import "./resolver/UsersActionResolver"
import "./validator/PostValidator"

app.context({
  currentUser: async () => {
    return {
      id: 1,
      firstName: "Natures",
      lastName: "Prophet",
    }
  }
})

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: appEntitiesToTypeormEntities(app),
  synchronize: true
})
  .then((connection) => {
    return app
      .setDataSource(connection)
      .setValidator(defaultValidator)
      .setLogger(debugLogger)
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          websocketPort: 3001,
          cors: true,
          graphiql: true,
          playground: true,
        })
      )
  })
  .then((result) => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })

