import { Core } from "kamboja"
import * as Express from "express"

export class ResponseAdapter implements Core.HttpResponse {
    body: any
    type: string
    status: number
    cookies: Core.Cookie[]
    header: { [key: string]: string | string[] }
    constructor(public nativeResponse: Express.Response, public nativeNextFunction: Express.NextFunction) { }

    private setup() {
        this.nativeResponse.set(this.header)
        this.nativeResponse.status(this.status || 200)
        if (this.cookies) {
            this.cookies.forEach(x => {
                this.nativeResponse.cookie(x.key, x.value, x.options)
            })
        }
    }

    json(){
        this.setup()
        this.nativeResponse.status(this.status).json(this.body)
    }

    redirect(path:string){
        this.setup()
        this.nativeResponse.redirect(path)
    }

    download(path:string){
        this.setup()
        this.nativeResponse.download(path)
    }

    file(path:string){
        this.setup()
        this.nativeResponse.sendFile(path)
    }

    render(viewName:string, model){
        this.setup()
        this.nativeResponse.render(viewName, model)
    }

    send() {
        this.setup()
        this.nativeResponse.contentType(this.type || "text/plain")
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