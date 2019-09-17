import {defaultServer} from "@framework/server";
import {app} from "@framework-sample/client-server-app-shared";
import {createTypeormEntities} from "@framework/server";
import {createConnection} from "typeorm";

import "./context"
import "./entity"
import "./resolver"
import "./validator"

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: createTypeormEntities(app),
  synchronize: true,
  // logging: true,
})
  .then((connection) => {
    return app
      .dataSource(connection)
      .bootstrap(
        defaultServer(app, {
          port: 3000
        })
      )
  })
  .then(() => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })
