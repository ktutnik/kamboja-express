import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressMiddlewareAdapter } from "../../src"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Morgan from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Logger from "morgan"
import { KambojaApplication } from "../../src/kamboja-express"
import { ErrorHandler } from "../harness/interceptor/error-handler"
import * as Path from "path"
import { ConcatMiddleware } from "./interceptor/concat-middleware"

describe("Integration", () => {

    describe("Controller", () => {
        let app: Express.Application
        beforeEach(() => {
            app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "view"))
                .set("view engine", "hbs")
                .init()
        })

        it("Should init express properly", () => {
            return Supertest(app)
                .get("/user/index")
                .expect((result) => {
                    Chai.expect(result.text).contain("user/index")
                })
                .expect(200)
        })

        it("Should able to write header from controller", () => {
            return Supertest(app)
                .get("/user/setheader")
                .expect((result) => {
                    Chai.expect(result.header["accept"]).eq("text/xml")
                })
                .expect(200)
        })

        it("Should able to receive request with query string", () => {
            return Supertest(app)
                .get("/user/with/123?iAge=20&bGraduated=true")
                .expect((result) => {
                    Chai.expect(result.type).eq("text/html")
                    Chai.expect(result.text).eq(`{"id":123,"age":20,"graduated":true}`)
                })
                .expect(200)
        })

        it("Should able return Express middleware from controller", () => {
            return Supertest(app)
                .get("/user/executemiddleware")
                .expect(401)
        })

        it("Should provide 404 if unhandled url requested", () => {
            return Supertest(app)
                .get("/unhandled/url")
                .expect(404)
        })

        it("Should able to intercept unhandled url from interception", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use("GlobalInterceptor, interceptor/global-interceptor")
                .init()
            return Supertest(app)
                .get("/unhandled/url")
                .expect((response) => {
                    Chai.expect(response.text).eq("HELLOW!!")
                })
                .expect(200)
        })
    })

    describe("ApiController", () => {
        it("Should handle `get` properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories/1")
                .expect((result) => {
                    Chai.expect(result.body).eq(1)
                })
                .expect(200)
        })

        it("Should handle `add` properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .post("/categories")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `list` with default value properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 1, limit: 10, query: '' })
                })
                .expect(200)
        })

        it("Should handle `list` with custom value properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories?iOffset=30&query=halo")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 30, limit: 10, query: 'halo' })
                })
                .expect(200)
        })

        it("Should handle `replace` properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .put("/categories/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `modify` properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .patch("/categories/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `delete` properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .delete("/categories/20")
                .expect((result) => {
                    Chai.expect(result.body).eq(20)
                })
                .expect(200)
        })
    })

    describe("ApiController With @http.root() logic", () => {
        let app: Express.Application;
        beforeEach(() => {
            app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .use(BodyParser.json())
                .init()
        })
        it("Should handle `get` properly", () => {
            return Supertest(app)
                .get("/categories/1/items/1")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 1, categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `add` properly", () => {
            return Supertest(app)
                .post("/categories/1/items")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with default value properly", () => {
            return Supertest(app)
                .get("/categories/1/items")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 1, limit: 10, query: '', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with custom value properly", () => {
            return Supertest(app)
                .get("/categories/1/items?iOffset=30&query=halo")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 30, limit: 10, query: 'halo', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `replace` properly", () => {
            return Supertest(app)
                .put("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `modify` properly", () => {
            return Supertest(app)
                .patch("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `delete` properly", () => {
            return Supertest(app)
                .delete("/categories/1/items/20")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 20, categoryId: 1 })
                })
                .expect(200)
        })
    })

    describe("Middleware Function", () => {
        it("Should be able to add middleware in global scope", async () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(new ExpressMiddlewareAdapter((req, res: Express.Response, next) => {
                    res.status(501)
                    res.end()
                }))
                .init()

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
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(new ExpressMiddlewareAdapter((req, res: Express.Response, next) => {
                    res.status(501)
                    res.end()
                }))
                .init()
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
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use((req, res: Express.Response, next) => {
                    res.status(501)
                    res.end()
                }).init()

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

        it("Should able to use KambojaJS middleware", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .init()

            return Supertest(app)
                .get("/user/withmiddleware")
                .expect(400)
        })

        it("Should invoke middleware in proper order", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(new ConcatMiddleware("global-01"))
                .use(new ConcatMiddleware("global-02"))
                .init()

            return Supertest(app)
                .get("/concat/index")
                .expect((result) => {
                    Chai.expect(result.text).eq("action-01 action-02 controller-01 controller-02 global-01 global-02 result")
                })
                .expect(200)
        })
    })

    describe("Error Handler", () => {
        it("Should handle error properly", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "view"))
                .set("view engine", "hbs")
                .init()
            return Supertest(app)
                .get("/user/haserror")
                .expect((result) => {
                    Chai.expect(result.text).contain("This user error")
                })
                .expect(500)
        })

        it("Should able to handle error from middleware", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "view"))
                .set("view engine", "hbs")
                .use(new ErrorHandler())
                .init()
            return Supertest(app)
                .get("/user/haserror")
                .expect((result) => {
                    Chai.expect(result.text).contain("oops!")
                })
                .expect(200)
        })

        it("Should able to get controller info from error handler", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None" })
                .set("views", Path.join(__dirname, "view"))
                .set("view engine", "hbs")
                .use(new ErrorHandler((i) => {
                    Chai.expect(i.controllerInfo.qualifiedClassName).eq("UserController, controller/usercontroller")
                }))
                .init()
            return Supertest(app)
                .get("/user/haserror")
                .expect(200)
        })

        it("Should able to handle internal system error", () => {
            let app = new KambojaApplication({ rootPath: __dirname, showLog: "None", controllerPaths: ["api"] })
                .set("views", Path.join(__dirname, "view"))
                .set("view engine", "hbs")
                .use(BodyParser.json())
                .use(new ErrorHandler())
                .init()
            return Supertest(app)
                .post("/categories")
                .type("application/json")
                .send(`{ "message": "Hello`)
                .expect((result) => {
                    Chai.expect(result.text).contain("oops!")
                })
                .expect(200)
        })
    })

})
