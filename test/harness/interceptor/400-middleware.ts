import { Core } from "kamboja"
import {middleware, HttpStatusError} from "../../../src"

export class Return400Middleware implements Core.Middleware{
    execute(request:Core.HttpRequest, next:Core.Invocation){
        throw new HttpStatusError(400)
    }
}