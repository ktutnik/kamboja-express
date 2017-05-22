import { internal, http, Controller, Core } from "kamboja"
import * as Model from "../model/user-model"
import { Request, Response, NextFunction } from "express"
import { MiddlewareActionResult, middleware } from "../../../src"
import { Return400Middleware } from "../interceptor/400-middleware"
import { response } from "../../../src"


let Middleware = (req: Request, res: Response, next: NextFunction) => {
    res.status(401)
    res.end()
}

export class UserController extends Controller {
    index() {
        return response.view()
    }

    hasError() {
        throw new Error("This user error")
    }

    executeMiddleware() {
        return new MiddlewareActionResult(Middleware)
    }


    @http.get("with/:id")
    withParam(id: string, iAge: number, bGraduated: boolean) {
        return { id: id, age: iAge, graduated: bGraduated }
    }

    @middleware.use(new Return400Middleware())
    withMiddleware() {
        return response.view()
    }

    setHeader() {
        let result = new Core.ActionResult({})
        result.header = { Accept: "text/xml" }
        return result;
    }
}