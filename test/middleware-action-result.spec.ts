import * as Kamboja from "kamboja"
import { ExpressEngine } from "../src"
import * as Chai from "chai"
import * as Supertest from "supertest"

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
            .get("/user/executeMiddleware")
            .expect(401)
    })
})