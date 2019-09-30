import {ApplicationProperties} from "../app";
import {AnyBlueprint, DeclarationSelection, DeclarationSelectorResult, executeQuery} from "../types";
import Observable = require("zen-observable");

/**
 * Operates over selected peace of data.
 */
export class SubscriptionSelector<
  Declaration extends AnyBlueprint,
  Selection extends DeclarationSelection<Declaration>
  > {

  readonly appProperties: ApplicationProperties
  readonly name: string
  readonly selection: Selection

  constructor(
    appProperties: ApplicationProperties,
    name: string,
    selection: Selection,
  ) {
    this.appProperties = appProperties
    this.name = name
    this.selection = selection
  }

  /**
   * Creates an observable that can be used to listen to changed data.
   */
  observe(): Observable<DeclarationSelectorResult<Declaration, Selection>> {
    return new Observable(observer => {
      // observer.next()
      // observer.complete();
      return () => {};
    });
  }

  /**
   * Fetches the selected data and subscribes to the data changes,
   * every time when data set is changed on the server, new results will be emitted.
   */
  // subscribe(fn: (data: DeclarationSelectorResult<Declaration, Selection>) => any) {
  // }

}

