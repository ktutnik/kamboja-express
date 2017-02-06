import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import * as Express from "express"
import * as Kamboja from "kamboja"


describe("ExpressEngine", () => {
    describe("General functions", () => {
        it("Should handle error properly", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view"
            })
            let app = engine.init();
            return Supertest(app)
                .get("/item/actionthrowserror")
                .expect((response: Supertest.Response) => {
                    let error: any = response.error;
                    Chai.expect(error.text).contain('Something bad happened')
                })
                .expect(500)
        })

        it("Should able to handle error manually", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view",
                errorHandler: (e: Kamboja.HttpError) => {
                    e.response.error(new Error("Error handled properly!"), 404)
                }
            })
            let app = engine.init();
            return Supertest(app)
                .get("/item/actionthrowserror")
                .expect((response: Supertest.Response) => {
                    let error: any = response.error;
                    Chai.expect(error.text).contain('Error handled properly!')
                })
                .expect(404)
        })

        it("Should able to handle error in production", async () => {
            process.env.NODE_ENV = 'production';

            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view",
                errorHandler: (e: Kamboja.HttpError) => {
                    e.response.error(new Error("Error handled properly!"), 404)
                }
            })
            let app = engine.init();
            return Supertest(app)
                .get("/item/actionthrowserror")
                .expect((response: Supertest.Response) => {
                    let error: any = response.error;
                    Chai.expect(error.text).contain('Not Found')
                })
                .expect(404)
        })

        it("Should throw when there are error in analysis", async () => {
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
                overrideAppEngine: (app: Express.Application) => {

                }
            })
            let app = engine.init();
        })
    })

    describe("ApiController", () => {
        it("Should host API convention properly", async () => {
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
    })

    describe("Controller", () => {
        it("Should host API convention properly", async () => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/controller"],
                viewPath: "test/harness/view"
            })
            let app = engine.init();
            return Supertest(app)
                .get("/user")
                .expect((response: Supertest.Response) => {
                    Chai.expect(response.text).contain("This is user/index")
                })
                .expect(200)
        })
    })
})