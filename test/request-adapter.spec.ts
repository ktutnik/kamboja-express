import * as Supertest from "supertest"
import * as Chai from "chai"
import { RequestAdapter } from "../src/request-adapter"
import * as Express from "express"
import * as Kamboja from "kamboja"


describe("RequestAdapter", () => {
    it("Should return cookie with case insensitive", async () => {
        let test = new RequestAdapter(<any>{
            cookies: { otherKey: "OtherValue", TheKey: "TheValue"  },
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

})