import { ActionResults } from "../src/action-results"
import * as Chai from "chai"
import * as Supertest from "supertest"
import * as Express from "express"
import { ResponseAdapter } from "../src/response-adapter"
import { RequestAdapter } from "../src/request-adapter"
import * as Morgan from "morgan"
import * as Path from "path"

describe("ActionResults", () => {
    it("Should able to response file download", () => {
        let app = Express()
        app.use((req, resp, next) => {
            let action = new ActionResults()
            let result = action.download("test/helper.js")
            result.execute(new RequestAdapter(req), new ResponseAdapter(resp, next), undefined)
        })
        return Supertest(app)
            .get("/")
            .expect((response) => {
                Chai.expect(response.header["content-disposition"]).eq(`attachment; filename="helper.js"`)
            })
            .expect(200)
    })

    it("Should able to response file download", () => {
        let app = Express()
        app.use((req, resp, next) => {
            //resp.sendFile("test/helper.js")
            let action = new ActionResults()
            let result = action.file(Path.join(process.cwd(), "test/helper.js"))
            result.execute(new RequestAdapter(req), new ResponseAdapter(resp, next), undefined)
        })
        return Supertest(app)
            .get("/")
            .expect((response) => {
                Chai.expect(response.type).eq(`application/javascript`)
            })
            .expect(200)
    })

    it("Should able to response redirect", () => {
        let app = Express()
        app.get("/user", (req, res) => {
            res.end()
        })
        app.use((req, resp, next) => {
            //resp.sendFile("test/helper.js")
            let action = new ActionResults()
            let result = action.redirect("/user")
            result.execute(new RequestAdapter(req), new ResponseAdapter(resp, next), undefined)
        })
        return Supertest(app)
            .get("/")
            .expect((response) => {
                Chai.expect(response.header["location"]).eq("/user")
            })
            .expect(302)
    })

    it("Should able to response json", () => {
        let app = Express()
        app.use((req, resp, next) => {
            //resp.sendFile("test/helper.js")
            let action = new ActionResults()
            let result = action.json({ message: "Hello" })
            result.execute(new RequestAdapter(req), new ResponseAdapter(resp, next), undefined)
        })
        return Supertest(app)
            .get("/")
            .expect((response) => {
                Chai.expect(response.body).deep.eq({ message: "Hello" })
            })
            .expect(200)
    })
})