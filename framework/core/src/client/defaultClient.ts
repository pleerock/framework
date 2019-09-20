import {Action, ActionType} from "../app";
import {AnyInputType, AnyRootInput, BlueprintAnyProperty} from "../types";
import {ApplicationClient} from "./ApplicationClient";

export const defaultClient = (options: {
  serverUrl: string
}): ApplicationClient => {
  return {
    graphql(body: string): Promise<any> {
      return fetch(options.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // todo: think how we can specify headers
        },
        body,
      })
        .then(function(response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
          } else {
            return Promise.reject(
              new Error(response.statusText || String(response.status)),
            )
          }
        })
        .then(request => request.json())
    },

    action(route: string, type: string, values: ActionType<any>): Promise<any> {
      let uri = options.serverUrl
      if (values.params instanceof Object) {
        for (let param in values.params) {
          route = route.replace(":" + param, (values.params as any)[param] as string)
        }
      }
      uri += route
      if (values.query) {
        uri += "?" + JSON.stringify(values.query)
      }
      return fetch(uri, {
        method: type,
        body: values.body ? JSON.stringify(values.body) : undefined,
        // headers: values.header ? JSON.stringify(values.header) : {}, // todo
        // cookies: values.cookies ? JSON.stringify(values.cookies) : {}, // todo
      })
        .then(function(response) {
          if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
          } else {
            return Promise.reject(
              new Error(response.statusText || String(response.status)),
            )
          }
        })
        .then(request => request.json())
    },

  }
}
