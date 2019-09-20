/**
 * All application errors.
 */
export const Errors = {
  noActionsDefined() {
    return new Error(`No actions are defined in the app.`)
  },
  noQueriesDefined() {
    return new Error(`No queries are defined in the app.`)
  },
  noMutationsDefined() {
    return new Error(`No mutations are defined in the app.`)
  },
  noModelsDefined() {
    return new Error(`No models are defined in the app.`)
  },
  noInputsDefined() {
    return new Error(`No inputs are defined in the app.`)
  },
  noDataSourceInApp() {
    return new Error(`Data source isn't setup in the app.`)
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
