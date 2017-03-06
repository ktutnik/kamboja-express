import { internal, Controller } from "kamboja"
import { express } from "../../../src"
import * as Model from "../model/user-model"
import * as Express from "express"

@express.middleware((req, res: Express.Response, next) => {
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
    @express.middleware((req, res: Express.Response, next) => {
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