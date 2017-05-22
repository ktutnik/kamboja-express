import { Core } from "kamboja"
import { ResponseAdapter } from "./response-adapter"

export class JsonActionResult extends Core.ActionResult {
    constructor(body, status?:number){
        super(body, status)
    }

    async execute(request: Core.HttpRequest, response: ResponseAdapter, routeInfo: Core.RouteInfo): Promise<void> {
        response.body = this.body
        response.cookies = this.cookies
        response.status = this.status || 200
        response.header = this.header
        response.json()
    }
}
