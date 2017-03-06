import * as Kamboja from "kamboja"
import * as Express from "express"

export interface ExpressEngineOption extends Kamboja.KambojaOption{
    middlewares:(Express.RequestHandler | Express.ErrorRequestHandler)[]
}