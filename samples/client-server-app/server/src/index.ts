require('dotenv').config()

import {app} from "@microframework-sample/client-server-app-shared";
import {debugLogger} from "@microframework/logger";
import {appEntitiesToTypeormEntities, defaultServer} from "@microframework/server";
import {defaultValidator} from "@microframework/validator";
import {PubSub} from "graphql-subscriptions";
import {createConnection} from "typeorm";
import {AppContext} from "./context";

import * as entities from "./entity";
import * as resolvers from "./resolver";
import * as validators from "./validator";

export const PubSubImpl = new PubSub()

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: appEntitiesToTypeormEntities(entities),
  synchronize: true,
  // logging: true,
})
  .then((connection) => {
    return app
      .setDataSource(connection)
      .setValidator(defaultValidator)
      .setLogger(debugLogger)
      .setGenerateModelRootQueries(true)
      .setEntities(entities)
      .setResolvers(resolvers)
      .setContext(AppContext)
      .setValidationRules(validators)
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          websocketPort: 3001,
          cors: true,
          graphiql: true,
          playground: true,
          pubSub: PubSubImpl
        })
      )
  })
  .then(() => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })
