import { Core } from "kamboja"
import * as Express from "express"

export class ResponseAdapter implements Core.HttpResponse {
    body: any
    type: string
    status: number
    cookies: Core.Cookie[]
    header: { [key: string]: string | string[] }
    constructor(public nativeResponse: Express.Response, public nativeNextFunction: Express.NextFunction) { }

    send() {
        this.nativeResponse.set(this.header)
        this.nativeResponse.contentType(this.type || "text/plain")
        this.nativeResponse.status(this.status || 200)
        if (this.cookies) {
            this.cookies.forEach(x => {
                this.nativeResponse.cookie(x.key, x.value, x.options)
            })
        }
        switch (typeof this.body) {
            case "number":
            case "boolean":
                this.nativeResponse.send(this.body.toString());
                break
            case "undefined":
                this.nativeResponse.end()
                break
            default:
                this.nativeResponse.send(this.body);
        }
    }
}