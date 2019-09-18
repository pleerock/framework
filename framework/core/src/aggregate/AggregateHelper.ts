import {ApplicationProperties} from "../app";
import {AggregateOptions, AggregateOptionsType} from "./aggregation";

/**
 * Aggregations helper - allows to select aggregations from the client.
 */
export class AggregateHelper<T extends AggregateOptions> {
  constructor(
    private appProperties: ApplicationProperties,
    private options: T,
  ) {
  }

  fetch(): Promise<AggregateOptionsType<T>> {
    if (!this.appProperties.client)
      throw new Error(`Client was not set, cannot perform fetch. Configure your app using app.setupClient(defaultClient({ ... })) first.`)

    // return this.client.fetch()
    return Promise.resolve() as any
  }
}
