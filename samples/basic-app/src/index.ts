import {appEntitiesToTypeormEntities, defaultServer} from "@microframework/server";
import {defaultValidator} from "@microframework/validator";
import {app} from "./app";
import {createConnection} from "typeorm";

import "./entity/PostEntity"
import "./entity/UserEntity"
import "./model/PostModel"
import "./model/UserModel"
import "./resolver/PostModelResolver"
import "./resolver/PostsQueryResolver"
import "./resolver/PostSaveMutationResolver"
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
      .dataSource(connection)
      .validator(defaultValidator)
      .bootstrap(
        defaultServer(app, {
          port: 3000,
          cors: true,
          graphiql: true,
        })
      )
  })
  .then((result) => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })

