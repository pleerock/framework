import {defaultServer} from "@framework/server";
import {app} from "@framework-sample/client-server-app-shared";
import {createTypeormEntities} from "@framework/server";
import {createConnection} from "typeorm";
import {Entities} from "./entity";
import {Resolvers} from "./resolver";
import {Validators} from "./validator";
import {Context} from "./context";

createConnection({
  type: "sqlite",
  database: "database.sqlite",
  entities: createTypeormEntities(app, Entities),
  synchronize: true
})
  .then((connection) => {
    console.log(connection.options);
    console.log("connection.entityMetadatas", connection.entityMetadatas);
    return app
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          resolvers: Resolvers,
          validators: Validators,
          entities: Entities,
          typeormConnection: connection,
          context: Context
        })
      )
  })
  .then((result) => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })
