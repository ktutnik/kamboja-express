import { Core, interceptor } from "kamboja"
import { MiddlewareActionResult } from "./middleware-action-result"
import {RequestHandler} from "express"

export class MiddlewareInterceptor implements Core.RequestInterceptor {
    constructor(private middleware: RequestHandler){}
    async intercept(invocation: Core.Invocation): Promise<Core.ActionResult> {
        let result = await invocation.execute()
        return new MiddlewareActionResult(this.middleware, result)
    }
}

export class Express {
    middleware(middleware:RequestHandler) {
        return interceptor.add(new MiddlewareInterceptor(middleware))
    }
}