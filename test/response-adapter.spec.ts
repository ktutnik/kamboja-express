import * as Supertest from "supertest"
import * as Chai from "chai"
import { ResponseAdapter } from "../src/response-adapter"
import * as Express from "express"
import * as Kamboja from "kamboja"
import * as Sinon from "sinon"

let HttpResponse: any = {
    render: function () { },
    sendFile: function () { },
    redirect: function () { },
    json: function () { },
    jsonp: function () { },
    send: function () { },
    status: function () { },
    end: function () { },
    error: function () { },
    cookie: function () { },
    clearCookie: function () { },
    contentType: function () { }
};

describe("RequestAdapter", () => {
    it("Should render view properly", async () => {
        let spy = Sinon.spy(HttpResponse, "render")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.view("the-view");
        Chai.expect(spy.getCall(0).args[0]).eq("the-view")
        spy.restore()
    })

    it("Should call json properly", async () => {
        let spy = Sinon.spy(HttpResponse, "json")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.json("the-json");
        test.json("the-json", 404)
        Chai.expect(spy.getCall(0).args[0]).eq("the-json")
        Chai.expect(spy.getCall(1).args).deep.eq([404, "the-json"])
        spy.restore()
    })

    it("Should call jsonp properly", async () => {
        let spy = Sinon.spy(HttpResponse, "jsonp")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.jsonp("the-json");
        test.jsonp("the-json", 404)
        Chai.expect(spy.getCall(0).args[0]).eq("the-json")
        Chai.expect(spy.getCall(1).args).deep.eq([404, "the-json"])
        spy.restore()
    })

    it("Should call file properly", async () => {
        let spy = Sinon.spy(HttpResponse, "sendFile")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.file("the/path");
        Chai.expect(spy.getCall(0).args[0]).eq("the/path")
        spy.restore()
    })

    it("Should call redirect properly", async () => {
        let spy = Sinon.spy(HttpResponse, "redirect")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.redirect("the/path");
        Chai.expect(spy.getCall(0).args[0]).eq("the/path")
        spy.restore()
    })

    it("Should call status properly", async () => {
        let spy = Sinon.spy(HttpResponse, "status")
        let sendSpy = Sinon.spy(HttpResponse, "send")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.status(404, "hellow");
        test.status(500)
        Chai.expect(spy.getCall(0).args[0]).eq(404)
        spy.restore()
        sendSpy.restore()
    })

    it("Should call end properly", async () => {
        let spy = Sinon.spy(HttpResponse, "end")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.end();
        Chai.expect(spy.called).true
        spy.restore()
    })

    it("Should call error properly", async () => {
        let spy = Sinon.spy()
        let test = new ResponseAdapter(<any>HttpResponse, spy)
        test.error(new Error("Error"));
        test.jsonp(new Error("Error"), 404)
        Chai.expect(spy.called).true
    })

    it("Should call cookie properly", async () => {
        let spy = Sinon.spy(HttpResponse, "cookie")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.setCookie("Key", "Value");
        Chai.expect(spy.getCall(0).args).deep.eq(["Key", "Value", undefined])
        spy.restore()
    })

    it("Should call clearCookie properly", async () => {
        let spy = Sinon.spy(HttpResponse, "clearCookie")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.removeCookie("Key", { path: "/user" });
        Chai.expect(spy.getCall(0).args).deep.eq(["Key", { path: "/user" }])
        spy.restore()
    })

    it("Should call contentType properly", async () => {
        let spy = Sinon.spy(HttpResponse, "contentType")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.setContentType("text/xml");
        Chai.expect(spy.getCall(0).args).deep.eq(["text/xml"])
        spy.restore()
    })

    it("Should call send properly", async () => {
        let spy = Sinon.spy(HttpResponse, "send")
        let test = new ResponseAdapter(<any>HttpResponse, () => { })
        test.send("Hello!");
        Chai.expect(spy.getCall(0).args).deep.eq(["Hello!"])
        spy.restore()
    })
})