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
    constructor(private middleware: RequestHandler, private chain?:Core.ActionResult) {
        super(null)
    }

    execute(request:RequestAdapter, response: ResponseAdapter, routeInfo: Core.RouteInfo) {
        this.middleware(request.request, response.response, response.next)
        if(this.chain) this.chain.execute(request, response, routeInfo)
    }
}