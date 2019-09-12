import {defaultServer} from "@framework/server";
import {PostModelResolver} from "./resolver/PostModelResolver";
import {PostsQueryResolver} from "./resolver/PostsQueryResolver";
import {PostEntity} from "./entity/PostEntity";
import {PostQueryResolver} from "./resolver/PostQueryResolver";
import {PostSaveMutationResolver} from "./resolver/PostSaveMutationResolver";
import {app} from "@framework-sample/client-server-app-shared";
import {PostValidator} from "./validator/PostValidator";
import {UserEntity} from "./entity/UserEntity";
import { UserModelResolver } from "./resolver/UserModelResolver";

app
  .bootstrap(
    defaultServer(app, {
      port: 3000,
      resolvers: [
        PostModelResolver,
        PostsQueryResolver,
        PostQueryResolver,
        PostSaveMutationResolver,
        UserModelResolver,
      ],
      entities: [
        PostEntity,
        UserEntity,
      ],
      validators: [
        PostValidator,
      ],
      context: {
        currentUser: async () => {
          return {
            id: 1,
            firstName: "Natures",
            lastName: "Prophet",
            fullName: ""
          }
        }
      }
    })
  )
  .then((result) => {
    console.log("Running a GraphQL API at http://localhost:3000/graphql")
  })
