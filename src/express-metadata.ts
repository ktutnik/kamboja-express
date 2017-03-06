
import * as Express from "express"

const MiddlewareMetadataKey = "kamboja-express:middleware"

export class ExpressMetaData {

    middleware(...middleware: (Express.RequestHandler | Express.ErrorRequestHandler)[]) {
        return (...args: any[]) => {
            if (args.length == 1) {
                let middlewares: (Express.RequestHandler | Express.ErrorRequestHandler)[] = Reflect.getMetadata(MiddlewareMetadataKey, args[0]) || []
                middlewares = middlewares.concat(middleware);
                Reflect.defineMetadata(MiddlewareMetadataKey, middlewares, args[0])
            }
            else {
                let interceptors: (Express.RequestHandler | Express.ErrorRequestHandler)[] = Reflect.getMetadata(MiddlewareMetadataKey, args[0], args[1]) || []
                interceptors = interceptors.concat(middleware);
                Reflect.defineMetadata(MiddlewareMetadataKey, interceptors, args[0], args[1])
            }
        }
    }

    static getMiddlewares(target, methodName?: string) {
        if (!target) return []
        if (!methodName) {
            let middlewares: (Express.RequestHandler | Express.ErrorRequestHandler)[] = Reflect.getMetadata(MiddlewareMetadataKey, target.constructor)
            return middlewares
        }
        else {
            let interceptors: (Express.RequestHandler | Express.ErrorRequestHandler)[] = Reflect.getMetadata(MiddlewareMetadataKey, target, methodName)
            return interceptors
        }
    }
}