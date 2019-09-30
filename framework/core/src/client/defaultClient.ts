if (!(global as any).window) {
  (global as any).window = {}
}

import {Action, ActionType} from "../app";
import {AnyInputType, AnyRootInput, BlueprintAnyProperty} from "../types";
import {ApplicationClient} from "./ApplicationClient";
import Observable = require("zen-observable");
import ReconnectingWebSocket from "reconnectingwebsocket";

export const defaultClient = (options: {
  serverUrl: string,
  websocketUrl?: string,
}): ApplicationClient => {
  let ws: ReconnectingWebSocket;
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

    init(): Promise<void> {

      return new Promise<void>((ok, fail) => {
        if (options.websocketUrl) {
          ws = new ReconnectingWebSocket(options.websocketUrl, ["graphql-ws"]);
          ws.onopen = () => {
            ws.send(JSON.stringify({
              type: "connection_init",
              payload: {}
            }));
            ok()
          };
          ws.onclose = () => {
          };
          ws.onmessage = (event: any) => {
            // this.eventDispatcher.dispatch(new RequestEvent());
            // this.onMessage.next(event);
          }
        }
      })
    },

    // subscription() {
  //   if (!ws)
  // throw new Error(`Websocket url must be set in the client.`)
    //   return new Observable<R>(observer => {
    //     const subscription = this.onMessage.subscribe(event => {
    //       const data = JSON.parse(event.data);
    //       if (data.payload && data.payload.data[name] !== undefined) {
    //         observer.next(convertCustomScalars(data.payload.data[name]));
    //       }
    //     });
    //
    //     return () => {
    //       subscription.unsubscribe();
    //     }
    //   });
    // }

  }
}
