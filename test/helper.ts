import {RouteGenerator, Test} from "kamboja"
import * as Sinon from "sinon"

export function delay(millisecond = 5){
    return new Promise((resolve, reject)=>{
        setTimeout(()=> {
            resolve()
        }, millisecond)
    })
}

export function spy<T>(obj:T) {
    return Test.mock(obj, Sinon.spy);
}

export function stub<T>(obj:T) {
    return Test.mock(obj, Sinon.stub)
}