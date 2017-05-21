import { Core } from "kamboja"
import { ResponseAdapter } from "./response-adapter"

export class DownloadActionResult extends Core.ActionResult {
    constructor(public path:string){
        super(undefined)
    }

    async execute(request: Core.HttpRequest, response: ResponseAdapter, routeInfo: Core.RouteInfo): Promise<void> {
        response.nativeResponse.download(this.path)
    }
}