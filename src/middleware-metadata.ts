import { Middleware, Core} from "kamboja"
import { RequestHandler } from "express"
import { ExpressMiddlewareAdapter } from "./express-middleware-adapter"

export class MiddlewareMetaData {

    private middleware:Middleware.MiddlewareDecorator = new Middleware.MiddlewareDecorator()
    
    use(middleware: RequestHandler | string | Core.Middleware) {
        if (typeof middleware == "function")
            return this.middleware.use(new ExpressMiddlewareAdapter(middleware))
        else
            return this.middleware.use(middleware)
    }

    id(id:string){
        return this.middleware.id(id)
    }
}