import * as Supertest from "supertest"
import * as Chai from "chai"
import { KambojaExpress, ExpressEngine } from "../src"
import { Core } from "kamboja"
import * as Express from "express"
import * as Morgan from "morgan"
import * as CookieParser from "cookie-parser"
import * as BodyParser from "body-parser"
import * as Logger from "morgan"
import * as Path from "path"

class LoggerMiddleware implements Core.Middleware{
    async execute(request:Core.HttpRequest, next:Core.Invocation){
        console.time()
        let result = await next.proceed()
        console.timeEnd()
        return result;
    }
}

describe("KambojaExpress", () => {
    it("Should able to use express middleware", () => {
        let app = new KambojaExpress(<Core.KambojaOption>{
            rootPath: __dirname,
            controllerPaths: ["harness/api"]
        })
            .use(Morgan("dev"))
            .use(BodyParser.json())
            .use(BodyParser.urlencoded({ extended: false }))
            .init()
        return Supertest(app)
            .get("/categories/hello")
            .expect((result) => {
                Chai.expect(result.body).contain("hello")
            })
            .expect(200)
    })

    it("Should able to use express middleware", () => {
        let app = new KambojaExpress(<Core.KambojaOption>{
            rootPath: __dirname,
            controllerPaths: ["harness/controller"]
        })
            .set("views", Path.join(__dirname, "harness/view"))
            .set("view engine", "hbs")
            .use(Morgan("dev"))
            .init()
        return Supertest(app)
            .get("/user/index")
            .expect((result) => {
                Chai.expect(result.text).contain("user/index")
            })
            .expect(200)
    })

    it("Should able to use KambojaJS middleware in global scope", () => {
        let app = new KambojaExpress(<Core.KambojaOption>{
            rootPath: __dirname,
            controllerPaths: ["harness/controller"]
        })
            .set("views", Path.join(__dirname, "harness/view"))
            .set("view engine", "hbs")
            .use(Morgan("dev"))
            .use(new LoggerMiddleware())
            .init()
        return Supertest(app)
            .get("/user/index")
            .expect((result) => {
                Chai.expect(result.text).contain("user/index")
            })
            .expect(200)
    })
})