import { Core } from "kamboja"
import { RequestHandler } from "express"
import { ResponseAdapter } from "./response-adapter"
import { RequestAdapter } from "./request-adapter"

export class MiddlewareActionResult extends Core.ActionResult {
    constructor(private middleware: RequestHandler) {
        super(null)
    }

    execute(request:RequestAdapter, response: ResponseAdapter, routeInfo: Core.RouteInfo) {
        this.middleware(request.request, response.response, response.next)
    }
}