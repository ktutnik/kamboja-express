import { Core } from "kamboja"
import { RequestHandler } from "express"
import { ResponseAdapter } from "./response-adapter"
import { RequestAdapter } from "./request-adapter"

export class MiddlewareActionResult extends Core.ActionResult {
    /**
     * Action result adapter for express middleware 
     * @param middleware Express middleware
     * @param chain Next action result will be executed, important when used inside request interceptor
     */
    constructor(private middleware: RequestHandler, private chain?: Core.Invocation) {
        super(null)
    }

    async execute(request:RequestAdapter, response: ResponseAdapter, routeInfo: Core.RouteInfo) {
        this.middleware(request.request, response.nativeResponse, response.nativeNextFunction)
        if(this.chain) {
            let result = await this.chain.proceed();
            await result.execute(request, response, routeInfo)
        }
    }
}