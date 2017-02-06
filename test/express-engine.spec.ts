import * as Supertest from "supertest"
import * as Chai from "chai"
import { ExpressEngine } from "../src/express-engine"
import * as Express from "express"


describe("ExpressEngine", () => {
    describe("ApiController", () => {
        let app: Express.Application;
        beforeEach(() => {
            let engine = new ExpressEngine({
                controllerPaths: ["test/harness/api"],
                viewPath: "test/harness/view"
            })
            app = engine.init();
        })

        it("getByPage should work properly", async () => {
            return Supertest(app)
                .get("/user/page/1/100")
                .expect((response: Supertest.Response) => {
                    Chai.expect(response.body).deep.eq([{ id: 1, name: "Ketut Sandiarsa" }])
                })
                .expect(200)
        })
    })

})