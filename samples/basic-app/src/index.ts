require('dotenv').config()

import {appEntitiesToTypeormEntities, defaultServer} from "@microframework/server";
import {defaultValidator} from "@microframework/validator";
import {debugLogger} from "@microframework/logger";
import {app} from "./app";
import {createConnection} from "typeorm";

import * as entities from "./entity"
import * as resolvers from "./resolver"
import * as validators from "./validator"

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
  entities: appEntitiesToTypeormEntities(entities),
  synchronize: true
})
  .then((connection) => {
    return app
      .setDataSource(connection)
      .setValidator(defaultValidator)
      .setLogger(debugLogger)
      .setEntities(entities)
      .setResolvers(resolvers)
      .setValidationRules(validators)
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

