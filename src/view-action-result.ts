import { Core } from "kamboja"
import { ResponseAdapter } from "./response-adapter"

const ViewOutsideControllerError = "Relative view path can not be use inside middlewares"

export class ViewActionResult extends Core.ActionResult {
    constructor(public model?, public viewName?: string) {
        super(null)
    }

    async execute(request: Core.HttpRequest, response: ResponseAdapter, routeInfo: Core.RouteInfo): Promise<void> {
        // results.view({})
        if (!this.viewName) {
            if (!routeInfo) throw new Error(ViewOutsideControllerError);
            let className = this.getClassName(routeInfo.qualifiedClassName)
            let viewPath = className + "/" + routeInfo.methodMetaData.name.toLowerCase()
            response.nativeResponse.render(viewPath, this.model);
        }
        // results.view({}, "list")
        else if (this.viewName && this.viewName.indexOf("/") == -1) {
            if (!routeInfo) throw new Error(ViewOutsideControllerError);
            let className = this.getClassName(routeInfo.qualifiedClassName)
            let viewPath = className + "/" + this.viewName;
            response.nativeResponse.render(viewPath, this.model);
        }
        // results.view({}, "user/list")
        else 
            response.nativeResponse.render(this.viewName, this.model);
    }

    private getClassName(fullQualifiedClassName: string) {
        let tokens = fullQualifiedClassName.split(",")
        let rawName = tokens[0].toLowerCase();
        let idx = rawName.lastIndexOf("controller");
        if (idx > 0)
            return rawName.substring(0, idx)
        return rawName;
    }
}
