import {app} from "@microframework-sample/client-server-app-shared";

app.context({
  currentUser: async ({ request }) => {
    // console.log(request);
    return {
      id: 1,
      firstName: "Natures",
      lastName: "Prophet",
      fullName: ""
    }
  }
})
