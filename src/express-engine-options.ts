import { Core } from "kamboja"
import * as Express from "express"

export interface ExpressEngineOption extends Core.KambojaOption {
    middlewares: (Express.RequestHandler | Express.ErrorRequestHandler)[]
}