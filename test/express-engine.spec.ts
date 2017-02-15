import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Lodash from "lodash"
import * as Fs from "fs"

let defaultOptions = <Kamboja.KambojaOption>{
    skipAnalysis: false,
    showConsoleLog: true,
    controllerPaths: ["controller"],
    modelPath: "model",
    viewPath: "view",
    staticFilePath: "public",
    viewEngine: "hbs",
    dependencyResolver: new Kamboja.DefaultDependencyResolver(new Kamboja.DefaultIdentifierResolver()),
    identifierResolver: new Kamboja.DefaultIdentifierResolver(),
}

let facade: Kamboja.Facade = {
    idResolver: new Kamboja.DefaultIdentifierResolver(),
    resolver: new Kamboja.DefaultDependencyResolver(new Kamboja.DefaultIdentifierResolver()),
    metadataStorage: new Kamboja.MetaDataStorage(new Kamboja.DefaultIdentifierResolver()),
    validators: []
}

describe("ExpressEngine", () => {
    it.only("Should init express properly", () => {
        let engine = new ExpressEngine()
        let options = Lodash.assign(defaultOptions, {
            controllerPaths: ["test/harness/controller"]
        })
        let routeGen = new Kamboja.RouteGenerator(options.controllerPaths, facade, Fs.readFileSync)
        let app = engine.init(routeGen.getRoutes(), options)
        return Supertest(app)
            .get("/user")
            .expect((result) => {
                console.log(result)
            })
            .expect(200)
    })
})