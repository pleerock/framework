import {AnyApplicationOptions} from "./ApplicationOptions";

/**
 * Type for the server implementation for application.
 */
export type ApplicationServer = (
  options: AnyApplicationOptions,
) => Promise<void>
