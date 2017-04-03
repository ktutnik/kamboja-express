import { Core, JsonActionResult } from "kamboja"


export class GlobalInterceptor implements Core.RequestInterceptor{
    async intercept(invocation:Core.Invocation){
        if(invocation.url.pathname == "/unhandled/url"){
            return new JsonActionResult("HELLOW!!", 200, undefined)
        }
        else return await invocation.execute()
    }
}