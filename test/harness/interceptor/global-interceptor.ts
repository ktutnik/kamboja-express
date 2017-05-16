import { Core, JsonActionResult } from "kamboja"
import {middleware} from "../../../src"

@middleware.id("kamboja-express:global")
export class GlobalInterceptor implements Core.Middleware{
    async execute(request:Core.HttpRequest, next:Core.Invocation){
        if(request.url.pathname == "/unhandled/url"){
            return new JsonActionResult("HELLOW!!", 200, undefined)
        }
        else return await next.proceed()
    }
}