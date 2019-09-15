export const Context = {
  currentUser: async ({ request }: { request: Request }) => {
    // console.log(request);
    return {
      id: 1,
      firstName: "Natures",
      lastName: "Prophet",
      fullName: ""
    }
  }
}
