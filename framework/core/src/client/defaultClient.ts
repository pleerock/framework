import {ApplicationClient} from "./ApplicationClient";

export const defaultClient = (options: {
  serverUrl: string
}): ApplicationClient => {
  return {
    fetch(body: string): Promise<any> {
      return fetch(options.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    }
  }
}
