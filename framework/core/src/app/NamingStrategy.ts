/**
 * Strategy for naming special identifiers used in the framework.
 */
export type NamingStrategy = {

  /**
   * Defines how generated root queries and mutations will be named.
   */
  generatedModelDeclarations: {
    one(modelName: string): string
    oneNotNull(modelName: string): string
    many(modelName: string): string
    count(modelName: string): string
    save(modelName: string): string
    remove(modelName: string): string
  }
}
