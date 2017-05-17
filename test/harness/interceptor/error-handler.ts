import { Core, JsonActionResult, ViewActionResult } from "kamboja"
import {middleware} from "../../../src"

export class ErrorHandler implements Core.Middleware{
    constructor(private callback?:(i:Core.Invocation) => void){}

    async execute(request:Core.HttpRequest, next:Core.Invocation){
        try{
            return await next.proceed()
        }
        catch(e){
            if(this.callback) this.callback(next)
            return new ViewActionResult({}, "_shared/error")
        }
    }
}