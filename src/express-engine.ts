import * as Kamboja from "kamboja"
import * as Express from "express"
import * as Logger from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Http from "http";
import * as Lodash from "lodash"
import * as Fs from "fs"
import {RequestAdapter} from "./request-adapter"
import {ResponseAdapter} from "./response-adapter"
import * as Chalk from "chalk"

export class ExpressEngine implements Kamboja.Engine {
    app:Express.Application;
    options:Kamboja.KambojaOption;
    constructor(options:Kamboja.KambojaOption, app?:Express.Application) {
        this.options = Lodash.assign(<Kamboja.KambojaOption>{
            skipAnalysis: false,
            showConsoleLog: true,
            controllerPaths: ["api", "controller"],
            viewPath: "view",
            staticFilePath: "public",
            viewEngine: "hbs",
            dependencyResolver: new Kamboja.DefaultDependencyResolver(),
            identifierResolver: new Kamboja.DefaultIdentifierResolver(),
        }, options)
    }

    private initExpress(options:Kamboja.KambojaOption) {
        let pathResolver = new Kamboja.PathResolver();
        let app = Express();
        app.set("views", pathResolver.resolve(options.viewPath))
        app.set("view engine", options.viewEngine)
        if(options.showConsoleLog) app.use(Logger("dev"))
        app.use(BodyParser.json())
        app.use(BodyParser.urlencoded({ extended: false }));
        app.use(CookieParser());
        app.use(Express.static(pathResolver.resolve(options.staticFilePath)))
        if (options.overrideAppEngine)
            options.overrideAppEngine(app)
        this.app = app;
    }

    private initErrorHandler() {
        let env = this.app.get('env')
        this.app.use((err, req, res, next) => {
            let status = err.status || 500;
            if (this.options.errorHandler) {
                this.options.errorHandler(new Kamboja.HttpError(status, err,
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

    private initController(routes: Kamboja.RouteInfo[]) {
        for (let route of routes) {
            if(route.analysis && route.analysis.length > 0) continue
            let method = route.httpMethod.toLowerCase();
            this.app[method](route.route, async (req, resp, next) => {
                let handler = new Kamboja.RequestHandler(route, this.options.dependencyResolver,
                    new RequestAdapter(req), new ResponseAdapter(resp, next))
                await handler.execute();
            })
        }
    }

    private generateRoutes(){
        let generator = new Kamboja.RouteGenerator(this.options.controllerPaths,
            this.options.identifierResolver, Fs.readFileSync)
        let routes = generator.getRoutes();
        
        let analyzer = new Kamboja.RouteAnalyzer(routes)
        let analysis = analyzer.analyse();
        for(let item of analysis){
            console.log()
            if(item.type == "Warning")
                console.log(Chalk.yellow(`[Kamboja] ${item.message}`))
            else 
                console.log(Chalk.red(`[Kamboja] ${item.message}`))
        }
        console.log();
        if(analysis.some(x => x.type == "Error")){
            console.log(Chalk.red("[Kamboja] Fatal Error: Shuting down..."))
            process.exit(5);
        }
        
        let result = routes.filter(x => x.analysis == null || x.analysis.length == 0)
        console.log()
        console.log("Routes")
        console.log("----------------------------------------")
        for(let route of result){
            console.log(`${route.httpMethod}\t${route.route}`)
        }
        console.log("----------------------------------------")
        console.log()
        return result;
    }

    init() {
        this.initExpress(this.options)
        let routes = this.generateRoutes()
        this.initController(routes)
        this.initErrorHandler()
        return this.app;
    }

}



