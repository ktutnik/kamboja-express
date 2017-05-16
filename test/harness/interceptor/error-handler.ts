import { Core, JsonActionResult, ViewActionResult } from "kamboja"
import {middleware} from "../../../src"

export class ErrorHandler implements Core.Middleware{
    async execute(request:Core.HttpRequest, next:Core.Invocation){
        try{
            return await next.proceed()
        }
        catch(e){
            return new ViewActionResult({}, "_shared/error")
        }
    }
}