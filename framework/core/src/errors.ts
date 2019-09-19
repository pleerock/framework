/**
 * All application errors.
 */
export const Errors = {
  noDataSourceInApp() {
    return new Error(`Data source isn't setup in the app`)
  },
  inputWasNotFound(name: string) {
    return new Error(`Input "${name}" was not found registered in the app.`)
  },
  modelWasNotFound(name: string) {
    return new Error(`Model "${name}" was not found registered in the app.`)
  },
  entityWasNotFound(modelName: string) {
    return new Error(`No entity for model "${modelName}" was not found registered in the app.`)
  }
}
