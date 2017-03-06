import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import { ExpressEngineOption } from "../src/express-engine-options"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Logger from "morgan"


describe("ExpressEngine", () => {
    it("Should init express properly", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view"
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/index")
            .expect((result) => {
                Chai.expect(result.text).contain("user/index")
            })
            .expect(200)
    })

    it("Should able to hide express logger", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view",
            showConsoleLog: false
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/index")
            .expect(200)
    })

    it("Should handle error properly", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view"
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/haserror")
            .expect((result) => {
                Chai.expect(result.text).contain("user error")
            })
            .expect(500)
    })

    it("Should able to handle error manually", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view",
            errorHandler: (error: Kamboja.HttpError) => {
                Chai.expect(error.error.message).contain("user error")
                error.response.error(error.error)
            }
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/haserror")
            .expect(500)
    })

    it("Should hide stack trace on production", () => {
        process.env.NODE_ENV = "production"
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view"
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/haserror")
            .expect(500)
    })

    it("Should able use existing express app", () => {
        let express = Express();
        let pathResolver = new Kamboja.PathResolver()
        express.set("views", pathResolver.resolve("test/harness/view"))
        express.set("view engine", "hbs")
        express.use(Logger("dev"))
        express.use(BodyParser.json())
        express.use(BodyParser.urlencoded({ extended: false }));
        express.use(CookieParser());
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(express), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view",
            errorHandler: (error: Kamboja.HttpError) => {
                Chai.expect(error.error.message).contain("user error")
                error.response.error(error.error)
            }
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/index")
            .expect(200)
    })

    it("Should be able to add middleware in global scope", async () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), <ExpressEngineOption>{
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view",
            middlewares: [
                (req, res:Express.Response, next) => {
                    res.status(501)
                    res.end()
                }
            ]
        })
        let app = kamboja.init()
        //class decorated with middleware to force them return 501
        //all actions below the class should return 501
        await new Promise((resolve, reject) => {
            Supertest(app)
                .get("/user/index")
                .expect(501, resolve)
        })

        await new Promise((resolve, reject) => {
            Supertest(app)
                .get("/methodscopedmiddleware/otherindex")
                .expect(501, resolve)
        })
    })

    it("Should be able to add middleware in class scope", async () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view"
        })
        let app = kamboja.init()
        //class decorated with middleware to force them return 501
        //all actions below the class should return 501
        await new Promise((resolve, reject) => {
            Supertest(app)
                .get("/classscopedmiddleware/index")
                .expect(501, resolve)
        })

        await new Promise((resolve, reject) => {
            Supertest(app)
                .get("/classscopedmiddleware/otherindex")
                .expect(501, resolve)
        })
    })

    it("Should be able to add middleware in method scope", async () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["test/harness/controller"],
            viewPath: "test/harness/view"
        })
        let app = kamboja.init()
        await new Promise((resolve, reject) => {
            //index decorated with middleware to force them return 501
            Supertest(app)
                .get("/methodscopedmiddleware/index")
                .expect(501, resolve)
        })

        await new Promise((resolve, reject) => {
            //otherindex should not affected by the the decorator
            Supertest(app)
                .get("/methodscopedmiddleware/otherindex")
                .expect(response => {
                    Chai.expect(response.body).eq("Hello!")
                })
                .expect(200, resolve)
        })
    })
})