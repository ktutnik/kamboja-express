import { internal, Controller } from "kamboja"
import { middleware } from "../../../src"
import * as Model from "../model/user-model"
import * as Express from "express"

@middleware.use((req, res: Express.Response, next) => {
    res.status(501)
    res.end()
})
export class ClassScopedMiddlewareController extends Controller {
    index() {
        return this.json("Hello!")
    }

    otherIndex() {
        return this.json("Hello!")
    }
}

export class MethodScopedMiddlewareController extends Controller {
    @middleware.use((req, res: Express.Response, next) => {
        res.status(501)
        res.end()
    })
    index() {
        return this.json("Hello!")
    }

    otherIndex() {
        return this.json("Hello!")
    }
}