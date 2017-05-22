import { Core } from "kamboja"
import { ResponseAdapter } from "./response-adapter"

export class FileActionResult extends Core.ActionResult {
    constructor(public path: string) {
        super(undefined)
    }

    async execute(request: Core.HttpRequest, response: ResponseAdapter, routeInfo: Core.RouteInfo): Promise<void> {
        response.cookies = this.cookies
        response.header = this.header
        response.file(this.path)
    }
}
