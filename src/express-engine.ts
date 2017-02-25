import { RequestAdapter } from "./request-adapter"
import { ResponseAdapter } from "./response-adapter"
import { ExpressEngineOption } from "./express-engine-options"
import { ExpressMetaData } from "./middleware-decorator"
import { Kamboja, KambojaOption, Engine, RequestHandler, Facade, PathResolver, HttpError, RouteInfo, DependencyResolver } from "kamboja"
import * as Express from "express"
import * as Logger from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Http from "http";
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Chalk from "chalk"

export class ExpressEngine implements Engine {

    constructor(private app?: Express.Application) { }

    private initExpress(options: KambojaOption) {
        let pathResolver = new PathResolver();
        let app = Express();
        app.set("views", pathResolver.resolve(options.viewPath))
        app.set("view engine", options.viewEngine)
        if (options.showConsoleLog) app.use(Logger("dev"))
        app.use(BodyParser.json())
        app.use(BodyParser.urlencoded({ extended: false }));
        app.use(CookieParser());
        app.use(Express.static(pathResolver.resolve(options.staticFilePath)))
        this.app = app;
    }

    private initErrorHandler(options: KambojaOption) {
        let env = this.app.get('env')
        this.app.use((err, req, res, next) => {
            let status = err.status;
            if (options.errorHandler) {
                options.errorHandler(new HttpError(status, err,
                    new RequestAdapter(req), new ResponseAdapter(res, next)))
            }
            else {
                res.status(status);
                res.render('error', {
                    message: err.message,
                    error: env == "development" ? err : {}
                });
            }
        })
    }

    private initController(routes: RouteInfo[], option: ExpressEngineOption) {
        if (option.middlewares && option.middlewares.length > 0)
            this.app.use(option.middlewares)
        let routeByClass = Lodash.groupBy(routes, "classMetaData.name")

        Lodash.forOwn(routeByClass, (routes, key) => {
            let classRoute = Express.Router()
            let controller = this.getController(routes[0], option.dependencyResolver)
            routes.forEach(route => {
                let requestHandler = async (req, resp, next) => {
                    let handler = new RequestHandler(option, route, new RequestAdapter(req), new ResponseAdapter(resp, next))
                    await handler.execute();
                }
                let methodRoute = Express.Router()
                let method = route.httpMethod.toLowerCase();
                let methodMiddlewares = ExpressMetaData.getMiddlewares(controller, route.methodMetaData.name)
                if (methodMiddlewares && methodMiddlewares.length > 0)
                    methodRoute[method](route.methodPath, methodMiddlewares, requestHandler)
                else
                    methodRoute[method](route.methodPath, requestHandler)
                let classMiddlewares = ExpressMetaData.getMiddlewares(controller)
                if (classMiddlewares && classMiddlewares.length > 0)
                    classRoute.use(routes[0].classPath, classMiddlewares, methodRoute)
                else
                    classRoute.use(routes[0].classPath, methodRoute)
            })
            this.app.use(classRoute)
        })
    }



    private getController(routeInfo: RouteInfo, resolver: DependencyResolver) {
        try {
            return resolver.resolve(routeInfo.classId)
        }
        catch (e) {
            throw new Error(`Can not instantiate [${routeInfo.classId}] as Controller`)
        }
    }

    init(routes: RouteInfo[], options: ExpressEngineOption) {
        if (!this.app) this.initExpress(options)
        this.initController(routes, options)
        this.initErrorHandler(options)
        return this.app;
    }
}



