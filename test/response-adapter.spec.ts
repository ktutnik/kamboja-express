import * as Supertest from "supertest"
import * as Chai from "chai"
import { ResponseAdapter } from "../src/response-adapter"
import * as Express from "express"
import * as Sinon from "sinon"
import * as BodyParser from "body-parser"
import * as Xml from "xml"

describe("ResponseAdapter", () => {

    it("Should send body properly", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.body = "Halo"
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.text).eq("Halo")
                Chai.expect(response.type).eq("text/plain")
            })
            .expect(200)
    })

    it("Should able to send number", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.body = 400
            adapter.type = "application/json"
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.body).eq(400)
            })
            .expect(200)
    })

    it("Should able to send boolean", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.body = false
            adapter.type = "application/json"
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.body).eq(false)
            })
            .expect(200)
    })

    it("Should send cookie properly", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.cookies = [{ key: "Key", value: "Value" }]
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.header["set-cookie"]).deep.eq([ 'Key=Value; Path=/' ])
            })
            .expect(200)
    })

    it("Should able to send header properly", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.header = {Accept: "text/xml"}
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.header["accept"]).eq("text/xml")
            })
            .expect(200)
    })

    it("Should set status properly", () => {
        return Supertest(Express().use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.status = 401
            adapter.send()
        }))
            .get("/")
            .expect(401)
    })

    it("Should set JSON properly", () => {
        return Supertest(Express().use(BodyParser.json()).use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.type = "application/json"
            adapter.body = { message: "Hello" }
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.body).deep.eq({ message: "Hello" })
                Chai.expect(response.type).eq("application/json")
            })
            .expect(200)
    })

    it("Should set XML properly", () => {
        return Supertest(Express().use(BodyParser.json()).use((req, resp, next) => {
            let adapter = new ResponseAdapter(resp, next)
            adapter.type = "text/xml"
            adapter.body = Xml({ message: "Hello" })
            adapter.send()
        }))
            .get("/")
            .expect((response) => {
                Chai.expect(response.text).eq("<message>Hello</message>")
                Chai.expect(response.type).eq("text/xml")
            })
            .expect(200)
    })
})