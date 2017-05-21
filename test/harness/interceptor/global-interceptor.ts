import { Core } from "kamboja"
import { middleware } from "../../../src"

@middleware.id("kamboja-express:global")
export class GlobalInterceptor implements Core.Middleware {
    async execute(request: Core.HttpRequest, next: Core.Invocation) {
        if (request.url.pathname == "/unhandled/url") {
            return "HELLOW!!"
        }
        return next.proceed()
    }
}