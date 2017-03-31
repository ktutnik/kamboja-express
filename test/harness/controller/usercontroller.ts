import { internal, Controller } from "kamboja"
import * as Model from "../model/user-model"
import { Request, Response, NextFunction } from "express"
import { MiddlewareActionResult } from "../../../src"


let Middleware = (req:Request, res:Response, next:NextFunction) => {
    res.status(401)
    res.end()
}

export class UserController extends Controller {
    index() {
        return this.view()
    }

    hasError() {
        throw new Error("This user error")
    }

    executeMiddleware() {
        return new MiddlewareActionResult(this.request, Middleware)
    }
}