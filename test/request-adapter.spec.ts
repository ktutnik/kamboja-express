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
        accept.withArgs("xml").returns("xml")
        accept.withArgs(["xml", "html"]).returns("xml")
        let test = new RequestAdapter(<any>{
            accepts: accept,
            header: () => { }
        })
        Chai.expect(test.getAccepts("xml")).eq("xml")
        Chai.expect(test.getAccepts(["xml", "html"])).eq("xml")
    })

    it("Should return isAuthenticated properly", async () => {
        let test = new RequestAdapter(<any>{
            isAuthenticated: function () { return true },
            header: () => { }
        })
        Chai.expect(test.isAuthenticated()).true
    })

    it("Should return user properly", async () => {
        let test = new RequestAdapter(<any>{
            user: {
                role: "admin",
                displayName: "Ketut Sandiarsa",
                id: "8083535"
            },
            header: () => { }
        })
        Chai.expect(test.user).deep.eq({
            role: "admin",
            displayName: "Ketut Sandiarsa",
            id: "8083535"
        })
    })

    it("Should return user role properly", async () => {
        let test = new RequestAdapter(<any>{
            user: {
                role: "admin",
                displayName: "Ketut Sandiarsa",
                id: "8083535"
            },
            header: () => { }
        })
        Chai.expect(test.getUserRole()).eq("admin")
    })

    it("getUserRole should not error when user is undefined", async () => {
        let test = new RequestAdapter(<any>{
            header: () => { }
        })
        Chai.expect(test.getUserRole()).undefined
    })
})