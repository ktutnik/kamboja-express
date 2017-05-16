import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressMiddlewareAdapter } from "../src"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Morgan from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Logger from "morgan"
import { KambojaExpress } from "../src/kamboja-express"
import * as Path from "path"

describe("Integration", () => {
    describe("General", () => {

    })

    describe("Controller", () => {
        it("Should init express properly", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .init()
            return Supertest(app)
                .get("/user/index")
                .expect((result) => {
                    Chai.expect(result.text).contain("user/index")
                })
                .expect(200)
        })

        it("Should able to receive request with query string", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .init()
            return Supertest(app)
                .get("/user/with/123?iAge=20&bGraduated=true")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 123, age: 20, graduated: true })
                })
                .expect(200)
        })


        it("Should handle error properly", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .init()
            return Supertest(app)
                .get("/user/haserror")
                .expect((result) => {
                    Chai.expect(result.text).contain("This user error")
                })
                .expect(500)
        })

        it("Should able to handle error from middleware", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .use("ErrorHandler, interceptor/error-handler")
                .init()
            return Supertest(app)
                .get("/user/haserror")
                .expect((result) => {
                    Chai.expect(result.text).contain("oops!")
                })
                .expect(200)
        })

        it("Should able return Express middleware from controller", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .init()
            return Supertest(app)
                .get("/user/executemiddleware")
                .expect(401)
        })

        it("Should provide 404 if unhandled url requested", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .use("ErrorHandler, interceptor/error-handler")
                .init()
            return Supertest(app)
                .get("/unhandled/url")
                .expect(404)
        })

        it("Should able to intercept unhandled url from interception", () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .use(Logger("dev"))
                .use(BodyParser.json())
                .use("GlobalInterceptor, interceptor/global-interceptor")
                .init()
            return Supertest(app)
                .get("/unhandled/url")
                .expect((response) => {
                    Chai.expect(response.body).eq("HELLOW!!")
                })
                .expect(200)
        })

        it("Should be able to add middleware in global scope", async () => {
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
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
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
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
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
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
            let app = new KambojaExpress(Path.join(__dirname, "harness"))
                .set("views", Path.join(__dirname, "harness/view"))
                .set("view engine", "hbs")
                .use(Logger("dev"))
                .init()

            return Supertest(app)
                .get("/user/withmiddleware")
                .expect(400)
        })

    })

    describe("ApiController", () => {
        it("Should handle `get` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
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
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .delete("/categories/20")
                .expect((result) => {
                    Chai.expect(result.body).eq(20)
                })
                .expect(200)
        })

        it("Should return json error if provided malformed JSON string", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .patch("/categories/20")
                .send(`{ "data": "Hello!`)
                .type("application/json")
                .expect((result) => {
                    //console.log(result)
                    Chai.expect(result.text).eq("Unexpected end of JSON input")
                })
                .expect(400)
        })
    })

    describe("ApiController With @http.root() logic", () => {
        it("Should handle `get` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories/1/items/1")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 1, categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `add` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .post("/categories/1/items")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with default value properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories/1/items")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 1, limit: 10, query: '', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with custom value properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .get("/categories/1/items?iOffset=30&query=halo")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 30, limit: 10, query: 'halo', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `replace` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .put("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `modify` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .patch("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `delete` properly", () => {
            let app = new KambojaExpress({ rootPath: Path.join(__dirname, "harness"), controllerPaths: ["api"] })
                .use(Logger("dev"))
                .use(BodyParser.json())
                .init()
            return Supertest(app)
                .delete("/categories/1/items/20")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 20, categoryId: 1 })
                })
                .expect(200)
        })
    })

})
