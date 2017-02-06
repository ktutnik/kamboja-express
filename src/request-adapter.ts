import * as Kamboja from "kamboja"
import * as Express from "express"
import * as Lodash from "lodash"


export class RequestAdapter implements Kamboja.HttpRequest {
    httpVersion:string
    httpMethod:Kamboja.HttpMethod
    headers: { [key: string]: string }
    cookies: { [key: string]: string }
    params: { [key: string]: string }
    body: any
    referrer: string
    url: string

    constructor(request: Express.Request) { 
        this.headers = request.headers
        this.cookies = request.cookies
        this.params = request.params
        this.body = request.body;
        this.httpVersion = request.httpVersion;
        this.httpMethod = <Kamboja.HttpMethod>request.method;
        this.url = request.originalUrl;
        this.referrer = request.header("referrer");
    }

    getHeader(key: string): string { return this.headers[key.toLowerCase()]; }
    getCookie(key: string): string { return this.cookies[key.toLowerCase()]; }
    getParam(key: string): string { return this.params[key.toLowerCase()]; }
}