import { Kamboja, Core } from "kamboja"
import { CoreExpressEngine } from "./core-express-engine"
import { ExpressMiddlewareAdapter } from "./express-middleware-adapter"
import { RequestHandler, Application } from "express"

export class KambojaExpress {
    private expressEngine: CoreExpressEngine;
    private kamboja: Kamboja;

    constructor(opt: string | Core.KambojaOption, engine?: CoreExpressEngine) {
        this.expressEngine = engine || new CoreExpressEngine();
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