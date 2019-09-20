import {ApplicationProperties} from "../app";
import {AnyBlueprint, DeclarationSelection, DeclarationSelectorResult, executeQuery} from "../types";

/**
 * Operates over selected peace of data.
 */
export class DeclarationSelector<
  Declaration extends AnyBlueprint,
  Selection extends DeclarationSelection<Declaration>
  > {

  readonly appProperties: ApplicationProperties
  readonly type: "query" | "mutation"
  readonly name: string
  readonly selection: Selection

  constructor(
    appProperties: ApplicationProperties,
    type: "query" | "mutation",
    name: string,
    selection: Selection,
  ) {
    this.appProperties = appProperties
    this.type = type
    this.name = name
    this.selection = selection
  }

  /**
   * Fetches the selected data.
   */
  async fetch(): Promise<DeclarationSelectorResult<Declaration, Selection>> {
    return executeQuery(this.appProperties.client, this.type, this.name as string, this.selection)
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  subscribe(fn: (data: DeclarationSelectorResult<Declaration, Selection>) => any) {
  }

}

