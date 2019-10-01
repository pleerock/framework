import {NamingStrategy} from "./NamingStrategy";

/**
 * Default framework naming strategy.
 */
export const DefaultNamingStrategy: NamingStrategy = {

  generatedModelDeclarations: {
    one(modelName: string) {
      return lowercaseFirstLetter(`${modelName}One`)
    },
    oneNotNull(modelName: string) {
      return lowercaseFirstLetter(`${modelName}NotNullOne`)
    },
    many(modelName: string) {
      return lowercaseFirstLetter(`${modelName}Many`)
    },
    count(modelName: string) {
      return lowercaseFirstLetter(`${modelName}Count`)
    },
    save(modelName: string) {
      return lowercaseFirstLetter(`${modelName}Save`)
    },
    remove(modelName: string) {
      return lowercaseFirstLetter(`${modelName}Remove`)
    },
  }

}

function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
