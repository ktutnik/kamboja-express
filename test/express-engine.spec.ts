import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import * as Express from "express"


describe("ExpressEngine", () => {
    describe("ApiController", () => {
        it("getByPage should work properly", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view"
            })
            let app = engine.init();
            return Supertest(app)
                .get("/user/page/1/100")
                .expect((response: Supertest.Response) => {
                    Chai.expect(response.body).deep.eq([{ id: 1, name: "Ketut Sandiarsa" }])
                })
                .expect(200)
        })

        it("Error handling should working properly", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/controller-with-errors"],
                viewPath: "test/harness/view"
            })
            Chai.expect(() => engine.init()).throw(/Fatal error/)
        })

        it("Should able to hide console log", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view",
                showConsoleLog: false
            })
            let app = engine.init();
        })

        it("Should able to override engine setup log", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view",
                overrideAppEngine: (app:Express.Application) => {
                    
                }
            })
            let app = engine.init();
        })
    })

})