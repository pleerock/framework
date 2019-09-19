import {defaultServer} from "@microframework/server";
import {app} from "@microframework-sample/client-server-app-shared";
import {appEntitiesToTypeormEntities} from "@microframework/server";
import {createConnection} from "typeorm";

import "./context"
import "./entity"
import "./resolver"
import "./validator"

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: appEntitiesToTypeormEntities(app),
  synchronize: true,
  // logging: true,
})
  .then((connection) => {
    return app
      .dataSource(connection)
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          cors: true,
          graphiql: true,
        })
      )
  })
  .then(() => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })
