import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src"
import { ExpressEngineOption } from "../src"
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/index")
            .expect((result) => {
                Chai.expect(result.text).contain("user/index")
            })
            .expect(200)
    })

    it("Should redirect to default page properly", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            defaultPage: "/user/index"
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/")
            .expect((result) => {
                Chai.expect(result.text).contain("user/index")
            })
            .expect(200)
    })


    it("Should able to hide express logger", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            showConsoleLog: false
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/index")
            .expect(200)
    })

    it("Should handle error properly", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            errorHandler: (error: Kamboja.Core.HttpError) => {
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/user/haserror")
            .expect(500)
    })

    it("Should provide 404 if unhandled url requested", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/unhandled/url")
            .expect(404)
    })

    it("Should able to intercept unhandled url from interception", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            interceptors: [
                "GlobalInterceptor, harness/interceptor/global-interceptor"
            ]
        })
        let app = kamboja.init()
        return Supertest(app)
            .get("/unhandled/url")
            .expect((response) => {
                Chai.expect(response.body).eq("HELLOW!!")
            })
            .expect(200)
    })

    it("Should able use existing express app", () => {
        let express = Express();
        let pathResolver = new Kamboja.Resolver.DefaultPathResolver(__dirname)
        express.set("views", pathResolver.resolve("harness/view"))
        express.set("view engine", "hbs")
        express.use(Logger("dev"))
        express.use(BodyParser.json())
        express.use(BodyParser.urlencoded({ extended: false }));
        express.use(CookieParser());
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(express), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            errorHandler: (error: Kamboja.Core.HttpError) => {
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            middlewares: [
                (req, res: Express.Response, next) => {
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
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
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname
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

    it("Should throw if invalid defaultPage provided", () => {
        let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
            controllerPaths: ["harness/controller"],
            viewPath: "harness/view",
            modelPath: "harness/model",
            rootPath: __dirname,
            defaultPage: "/otherpage/index"
        })
        Chai.expect(() => {
            kamboja.init()
        }).throw("Controller to handle /otherpage/index is not found, please specify correct 'defaultPage' in kamboja configuration")
    })
})