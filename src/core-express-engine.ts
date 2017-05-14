import { RequestAdapter } from "./request-adapter"
import { ResponseAdapter } from "./response-adapter"
import { Kamboja, Core, Resolver, Engine } from "kamboja"
import * as Express from "express"
import * as Http from "http";
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Chalk from "chalk"

export class CoreExpressEngine implements Core.Engine {
    application: Express.Application

    constructor() {
        this.application = Express();
    }

    protected initExpress(options: Core.KambojaOption) {
    }

    private initController(routes: Core.RouteInfo[], option: Core.KambojaOption) {
        let route = routes.filter(x => option.defaultPage &&
            x.route.toLowerCase() == option.defaultPage.toLowerCase())[0]
        if (route) {
            this.application.get("/", async (req, resp, next) => {
                let container = new Engine.ControllerFactory(option, route)
                let handler = new Engine.RequestHandler(container, new RequestAdapter(req), new ResponseAdapter(resp, next), option)
                await handler.execute();
            })
        }
        else throw new Error(`Controller to handle ${option.defaultPage} is not found, please specify correct 'defaultPage' in kamboja configuration`)

        routes.forEach(route => {
            let method = route.httpMethod.toLowerCase()
            this.application[method](route.route, async (req, resp, next) => {
                let container = new Engine.ControllerFactory(option, route)
                let handler = new Engine.RequestHandler(container, new RequestAdapter(req), new ResponseAdapter(resp, next), option)
                await handler.execute();
            })
        })

        //rest of the unhandled request and 404 handler
        this.application.use(async (req, resp, next) => {
            let container = new Engine.ControllerFactory(option)
            let handler = new Engine.RequestHandler(container, new RequestAdapter(req), new ResponseAdapter(resp, next), option)
            await handler.execute();
        })

        //error handler
        this.application.use((err, req, res, next) => {
            let handler = new Engine.ErrorHandler(err, option, new RequestAdapter(req), new ResponseAdapter(res, next))
            handler.execute()
        })
    }

    init(routes: Core.RouteInfo[], options: Core.KambojaOption) {
        this.initExpress(options)
        this.initController(routes, options)
        return this.application;
    }
}



