import { RequestAdapter } from "./request-adapter"
import { ResponseAdapter } from "./response-adapter"
import { Kamboja, KambojaOption, Engine, RequestHandler, Facade, PathResolver, HttpError, RouteInfo } from "kamboja"
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

    private initController(routes: RouteInfo[], option:KambojaOption) {
        for (let route of routes) {
            let method = route.httpMethod.toLowerCase();
            this.app[method](route.route, async (req, resp, next) => {
                let handler = new RequestHandler(option.getStorage(), option.dependencyResolver, option.validators, route,
                    new RequestAdapter(req), new ResponseAdapter(resp, next))
                await handler.execute();
            })
        }
    }

    init(routes: RouteInfo[], options: KambojaOption) {
        if (!this.app) this.initExpress(options)
        this.initController(routes, options)
        this.initErrorHandler(options)
        return this.app;
    }

}



