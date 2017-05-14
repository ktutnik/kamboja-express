import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine, CoreExpressEngine, ExpressMiddlewareAdapter } from "../src"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Lodash from "lodash"
import * as Fs from "fs"
import * as Morgan from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Logger from "morgan"

describe("Integration", () => {
    describe("General", () => {
        
    })

    describe("Controller", () => {
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

        it("Should able to receive request with query string", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/controller"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/user/with/123?iAge=20&bGraduated=true")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 123, age: 20, graduated: true })
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
                    Chai.expect(result.text).contain("oops!")
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
                middlewares: [
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

        it("Should be able to add middleware in global scope", async () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/controller"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname,

            })

            let app = kamboja.use(new ExpressMiddlewareAdapter((req, res: Express.Response, next) => {
                res.status(501)
                res.end()
            })).init()

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

    describe("ApiController", () => {
        it("Should handle `get` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories/1")
                .expect((result) => {
                    Chai.expect(result.body).eq(1)
                })
                .expect(200)
        })

        it("Should handle `add` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .post("/categories")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `list` with default value properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 1, limit: 10, query: '' })
                })
                .expect(200)
        })

        it("Should handle `list` with custom value properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories?iOffset=30&query=halo")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 30, limit: 10, query: 'halo' })
                })
                .expect(200)
        })

        it("Should handle `replace` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .put("/categories/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `modify` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .patch("/categories/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!" })
                })
                .expect(200)
        })

        it("Should handle `delete` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .delete("/categories/20")
                .expect((result) => {
                    Chai.expect(result.body).eq(20)
                })
                .expect(200)
        })
    })

    describe("ApiController With @http.root() logic", () => {
        it("Should handle `get` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories/1/items/1")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 1, categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `add` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .post("/categories/1/items")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with default value properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories/1/items")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 1, limit: 10, query: '', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `list` with custom value properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .get("/categories/1/items?iOffset=30&query=halo")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ offset: 30, limit: 10, query: 'halo', categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `replace` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .put("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `modify` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .patch("/categories/1/items/20")
                .send({ data: "Hello!" })
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ data: "Hello!", categoryId: 1 })
                })
                .expect(200)
        })

        it("Should handle `delete` properly", () => {
            let kamboja = new Kamboja.Kamboja(new ExpressEngine(), {
                controllerPaths: ["harness/api"],
                viewPath: "harness/view",
                modelPath: "harness/model",
                rootPath: __dirname
            })
            let app = kamboja.init()
            return Supertest(app)
                .delete("/categories/1/items/20")
                .expect((result) => {
                    Chai.expect(result.body).deep.eq({ id: 20, categoryId: 1 })
                })
                .expect(200)
        })
    })

})
