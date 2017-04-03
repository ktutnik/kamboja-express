import { Core, JsonActionResult } from "kamboja"


export class GlobalInterceptor implements Core.RequestInterceptor{
    async intercept(invocation:Core.Invocation){
        if(invocation.url == "/unhandled/url"){
            invocation.returnValue = new JsonActionResult("HELLOW!!", 200, undefined)
        }
        else await invocation.execute()
    }
}