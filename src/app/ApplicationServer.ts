import {AnyApplicationOptions} from "./ApplicationOptions";

export type ApplicationServer = (
  options: AnyApplicationOptions,
) => Promise<void>
