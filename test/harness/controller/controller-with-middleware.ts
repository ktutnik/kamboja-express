import { internal, Controller } from "kamboja"
import { middleware, response } from "../../../src"
import * as Model from "../model/user-model"
import * as Express from "express"

@middleware.use((req, res: Express.Response, next) => {
    res.status(501)
    res.end()
})
export class ClassScopedMiddlewareController extends Controller {
    index() {
        return "Hello!"
    }

    otherIndex() {
        return "Hello!"
    }
}

export class MethodScopedMiddlewareController extends Controller {
    @middleware.use((req, res: Express.Response, next) => {
        res.status(501)
        res.end()
    })
    index() {
        return "Hello!"
    }

    otherIndex() {
        return "Hello!"
    }
}