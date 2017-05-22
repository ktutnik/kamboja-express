import { Kamboja, Core } from "kamboja"
import { ExpressEngine } from "./express-engine"
import { ExpressMiddlewareAdapter } from "./express-middleware-adapter"
import { RequestHandler, Application } from "express"

export class KambojaApplication {
    private expressEngine: ExpressEngine;
    private kamboja: Kamboja;

    constructor(opt: string | Core.KambojaOption) {
        this.expressEngine = new ExpressEngine();
        this.kamboja = new Kamboja(this.expressEngine, opt)
    }

    set(setting: string, value: string) {
        this.expressEngine.application.set(setting, value)
        return this;
    }

    use(middleware: RequestHandler | Core.Middleware | string) {
        if (typeof middleware == "function") {
            this.expressEngine.application.use(middleware)
        }
        else {
            this.kamboja.use(middleware)
        }
        return this;
    }

    init(): Application {
        return this.kamboja.init();
    }
}