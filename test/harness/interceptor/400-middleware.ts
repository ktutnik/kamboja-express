import { Core, JsonActionResult, StatusActionResult } from "kamboja"
import {middleware} from "../../../src"

export class Return400Middleware implements Core.Middleware{
    execute(request:Core.HttpRequest, next:Core.Invocation){
        return new StatusActionResult(400)
    }
}