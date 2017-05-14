import { Core, Middleware } from "kamboja"
import { MiddlewareActionResult } from "./middleware-action-result"
import { RequestHandler } from "express"

export class ExpressMiddlewareAdapter implements Core.Middleware {
    constructor(private middleware: RequestHandler) { }
    async execute(request: Core.HttpRequest, next: Core.Invocation): Promise<Core.ActionResult> {
        let result = await next.proceed()
        return new MiddlewareActionResult(this.middleware, next)
    }
}