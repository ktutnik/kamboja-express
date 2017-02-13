import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import * as Express from "express"
import * as Kamboja from "kamboja"


describe("ExpressEngine", () => {
    it("Should init express properly", () => {
        let engine = new ExpressEngine()
        engine.init(null, {controllerPaths: ["test/harness/controller"]})
    })
})