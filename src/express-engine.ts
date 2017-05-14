import { CoreExpressEngine } from "./core-express-engine"
import { Core } from "kamboja"
import * as Express from "express"
import * as Logger from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"

export class ExpressEngine extends CoreExpressEngine {
    constructor() { super() }

    protected initExpress(options: Core.KambojaOption) {
        let pathResolver = options.pathResolver
        this.application.set("views", pathResolver.resolve(options.viewPath))
        this.application.set("view engine", options.viewEngine)
        if (options.showConsoleLog) this.application.use(Logger("dev"))
        this.application.use(BodyParser.json())
        this.application.use(BodyParser.urlencoded({ extended: false }));
        this.application.use(CookieParser());
        this.application.use(Express.static(pathResolver.resolve(options.staticFilePath)))
    }
}