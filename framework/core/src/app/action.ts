// import {NextFunction, Request, Response} from "express";
type NextFunction = any
type Request = any
type Response = any

import {
  AnyBlueprint,
  AnyBlueprintType,
  Blueprint,
  BlueprintPrimitiveProperty,
} from "./core";
import {BlueprintArray, BlueprintOptional, Model, ModelReference} from "./operators";

/**
 * Defines what declaration can return.
 */
export type ActionReturn =
  | BlueprintPrimitiveProperty // todo: check if we really can return it
  | Blueprint
  | BlueprintArray<any>
  | BlueprintOptional<any> // todo: check if we really can return it
  | Model<any>
  | ModelReference<any>

export type ActionRequestOptions<
  ParamBlueprint extends AnyBlueprint,
  QueryBlueprint extends AnyBlueprint,
  HeaderBlueprint extends AnyBlueprint,
  CookieBlueprint extends AnyBlueprint,
  BodyBlueprint extends AnyBlueprint,
  ReturnBlueprint extends ActionReturn,
  > = {
  params?: ParamBlueprint
  query?: QueryBlueprint
  header?: HeaderBlueprint
  cookie?: CookieBlueprint
  body?: BodyBlueprint
  return?: ReturnBlueprint
}

export class ActionRequest<
  ParamBlueprint extends AnyBlueprint,
  QueryBlueprint extends AnyBlueprint,
  HeaderBlueprint extends AnyBlueprint,
  CookieBlueprint extends AnyBlueprint,
  BodyBlueprint extends AnyBlueprint,
  ReturnBlueprint extends ActionReturn,
  > {
  constructor(public options: ActionRequestOptions<
    ParamBlueprint,
    QueryBlueprint,
    HeaderBlueprint,
    CookieBlueprint,
    BodyBlueprint,
    ReturnBlueprint>) {
  }
}


export function actionRequest<
  ParamType extends AnyBlueprint,
  QueryType extends AnyBlueprint,
  HeaderType extends AnyBlueprint,
  CookieType extends AnyBlueprint,
  BodyType extends AnyBlueprint,
  ReturnType extends ActionReturn
  > (
  options: ActionRequestOptions<
    ParamType,
    QueryType,
    HeaderType,
    CookieType,
    BodyType,
    ReturnType>) {
  return new ActionRequest(options)
}

export class HttpError extends Error {
  status?: number
  constructor(status: number, message?: string) {
    super()
    Object.setPrototypeOf(this, HttpError.prototype)
    if (status) this.status = status
    if (message) this.message = message
    this.stack = new Error().stack
  }
}

function handleSuccess(res: Response, result: any) {
  if (result === undefined) throw new HttpError(404, `Resource was not found`)

  if (typeof result === "object") {
    res.json(result)
  } else {
    res.send(result)
  }
}

export const action = function<
  ParamType extends AnyBlueprint,
  QueryType extends AnyBlueprint,
  HeaderType extends AnyBlueprint,
  CookieType extends AnyBlueprint,
  BodyType extends AnyBlueprint,
  ReturnType extends ActionReturn
  >(
  actionRequest: ActionRequest<ParamType, QueryType, HeaderType, CookieType, BodyType, ReturnType>,
  handler: (options: {
    request: Request
    response: Response
    next?: NextFunction
    log: {
      error: (message: string) => void
    }
    params: AnyBlueprintType<ParamType>
    query: AnyBlueprintType<QueryType>
    header: AnyBlueprintType<HeaderType>
    cookie: AnyBlueprintType<CookieType>
    body: AnyBlueprintType<BodyType>
  }) => Promise<AnyBlueprintType<ReturnType>> | AnyBlueprintType<ReturnType>
): (request: Request, response: Response, next?: NextFunction) => Promise<AnyBlueprintType<ReturnType>> | AnyBlueprintType<ReturnType> {
  return (request: Request, response: Response, next?: NextFunction) => {
    return undefined as any
  }
}

function handleError(res: Response, error: any) {
  const responseBody: { error?: string; stack?: string } = {
    error: error.message ? error.message : error.toString(),
  }

  // if (process.env.NODE_ENV === 'development') {
  responseBody.stack = (error as Error).stack
  // }

  res.status(error.status ? error.status : 400)
  res.json(responseBody)
}
