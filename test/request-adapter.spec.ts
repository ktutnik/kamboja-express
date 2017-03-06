import * as Supertest from "supertest"
import * as Chai from "chai"
import { RequestAdapter } from "../src/request-adapter"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Sinon from "sinon"


describe("RequestAdapter", () => {
    it("Should return cookie with case insensitive", async () => {
        let test = new RequestAdapter(<any>{
            cookies: { otherKey: "OtherValue", TheKey: "TheValue" },
            header: () => { }
        })
        Chai.expect(test.getCookie("thekey")).eq("TheValue")
    })

    it("Should return header with case insensitive", async () => {
        let test = new RequestAdapter(<any>{
            headers: { TheKey: "TheValue" },
            header: () => { }
        })
        Chai.expect(test.getHeader("thekey")).eq("TheValue")
    })

    it("Should return params with case insensitive", async () => {
        let test = new RequestAdapter(<any>{
            params: { TheKey: "TheValue" },
            header: () => { }
        })
        Chai.expect(test.getParam("thekey")).eq("TheValue")
    })

    it("Should check Accept header", async () => {
        let accept = Sinon.stub()
        accept.withArgs("text/xml").returns("xml")
        let test = new RequestAdapter(<any>{
            accepts: accept,
            header: () => { }
        })
        Chai.expect(test.isAccept("text/xml")).true
    })

    it("Should return false if no Accept header", async () => {
        let accept = Sinon.stub()
        accept.withArgs("application/json").returns("json")
        let test = new RequestAdapter(<any>{
            accepts: accept,
            header: () => { }
        })
        Chai.expect(test.isAccept("text/xml")).false
    })
})