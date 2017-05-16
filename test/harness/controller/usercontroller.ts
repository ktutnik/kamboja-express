import { internal, http, Controller } from "kamboja"
import * as Model from "../model/user-model"
import { Request, Response, NextFunction } from "express"
import { MiddlewareActionResult, middleware } from "../../../src"
import { Return400Middleware } from "../interceptor/400-middleware"


let Middleware = (req: Request, res: Response, next: NextFunction) => {
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
        return new MiddlewareActionResult(Middleware)
    }


    @http.get("with/:id")
    withParam(id: string, iAge: number, bGraduated: boolean) {
        return this.json({ id: id, age: iAge, graduated: bGraduated })
    }

    @middleware.use(new Return400Middleware())
    withMiddleware() {
        return this.view()
    }
}