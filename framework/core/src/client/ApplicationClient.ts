import {Action, ActionType} from "../app";

export type ApplicationClient = {
  graphql(data: string): Promise<any>
  action(route: string, type: string, values: ActionType<any>): Promise<any>
}
