import { Core } from "kamboja"
import {middleware, HttpStatusError} from "../../../src"

export class ConcatMiddleware implements Core.Middleware{
    constructor(public order:string){}
    async execute(request:Core.HttpRequest, next:Core.Invocation){
        let actionResult = await next.proceed()
        actionResult.body = this.order + " " + actionResult.body
        return actionResult;
    }
}