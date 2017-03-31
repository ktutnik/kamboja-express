import { Core } from "kamboja"
import { RequestHandler } from "express"
import { ResponseAdapter } from "./response-adapter"
import { RequestAdapter } from "./request-adapter"

export class MiddlewareActionResult extends Core.ActionResult {
    constructor(private request:Core.HttpRequest, private middleware: RequestHandler) {
        super(null)
    }

    execute(response: ResponseAdapter, routeInfo: Core.RouteInfo) {
        let request = <RequestAdapter>this.request
        this.middleware(request.request, response.response, response.next)
    }
}