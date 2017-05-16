import { RequestAdapter } from "./request-adapter"
import { ResponseAdapter } from "./response-adapter"
import { Kamboja, Core, Resolver, RequestHandler } from "kamboja"
import * as Express from "express"
import * as Http from "http";
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Chalk from "chalk"

export class ExpressEngine implements Core.Engine {
    application: Express.Application

    constructor() {
        this.application = Express();
    }

    init(routes: Core.RouteInfo[], option: Core.KambojaOption) {
        //routes
        routes.forEach(route => {
            let method = route.httpMethod.toLowerCase()
            this.application[method](route.route, async (req, resp, next) => {
                let handler = new RequestHandler(option, new RequestAdapter(req), new ResponseAdapter(resp, next), route)
                await handler.execute();
            })
        })

        //rest of the unhandled request and 404 handler
        this.application.use(async (req, resp, next) => {
            let handler = new RequestHandler(option, new RequestAdapter(req), new ResponseAdapter(resp, next))
            await handler.execute();
        })

        //error handler
        this.application.use(async (err, req, res, next) => {
            let handler = new RequestHandler(option, new RequestAdapter(req), new ResponseAdapter(res, next), err)
            await handler.execute()
        })
        return this.application;
    }
}



