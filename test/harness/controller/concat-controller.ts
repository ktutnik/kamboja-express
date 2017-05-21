import { Controller } from "kamboja"
import { middleware } from "../../../src"
import { ConcatMiddleware } from "../interceptor/concat-middleware"

@middleware.use(new ConcatMiddleware("controller-01"))
@middleware.use(new ConcatMiddleware("controller-02"))
export class ConcatController extends Controller {
    @middleware.use(new ConcatMiddleware("action-01"))
    @middleware.use(new ConcatMiddleware("action-02"))
    index() {
        return "result"
    }
}