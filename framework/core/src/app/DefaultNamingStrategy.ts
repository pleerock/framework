import {NamingStrategy} from "./NamingStrategy";

/**
 * Default framework naming strategy.
 */
export const DefaultNamingStrategy: NamingStrategy = {

  /**
   *
   */
  generatedModelDeclarations: {
    one(modelName: string) {
      return `_model_${modelName}_one`
    },
    many(modelName: string) {
      return `_model_${modelName}_many`
    },
    count(modelName: string) {
      return `_model_${modelName}_count`
    },
    save(modelName: string) {
      return `_model_${modelName}_save`
    },
    remove(modelName: string) {
      return `_model_${modelName}_remove`
    },
  }

}
