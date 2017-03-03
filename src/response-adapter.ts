import * as Kamboja from "kamboja"
import * as Express from "express"


export class ResponseAdapter implements Kamboja.HttpResponse {
    constructor(private response: Express.Response, private next:Express.NextFunction) { }

    setCookie(key:string, value:string, option?:Kamboja.CookieOptions){
        this.response.cookie(key, value, option)
    }

    json(body, status?:number) {
        if(status)
            this.response.json(status, body);
        else
            this.response.json(body)
     }

     jsonp(body, status?:number) {
        if(status)
            this.response.jsonp(status, body);
        else
            this.response.jsonp(body)
     }

     view(name, model?){
         this.response.render(name, model)
     }

     file(path:string){
         this.response.sendFile(path)
     }

     redirect(url:string){
         this.response.redirect(url)
     }

     status(status:number, message?:string){
         this.response.status(status)
         if(message) this.response.send(message)
     }

     end(){
         this.response.end()
     }

     error(error, status?:number) {
        error.status = status || 500
        this.next(error)
     }

     setContentType(type:string){
         this.response.contentType(type)
     }

     send(body){
         this.response.send(body)
     }

     removeCookie(key:string, options?:Kamboja.CookieOptions){
         this.response.clearCookie(key, options)
     }
}