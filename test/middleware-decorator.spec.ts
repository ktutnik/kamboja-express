import { ExpressMetaData, express } from "../src"
import * as Chai from "chai"

@express.middleware((req, resp, next) => "Class")
class MyTargetClass {
    @express.middleware((req, resp, next) => "Method")
    theMethod() { }
}

describe("Interceptor Decorator", () => {
    it("Should get class interceptors", () => {
        let target = new MyTargetClass();
        let result = <Function[]>ExpressMetaData.getMiddlewares(target);
        Chai.expect(result[0]()).eq("Class")
    })

    it("Should get method interceptors", () => {
        let target = new MyTargetClass();
        let result = <Function[]>ExpressMetaData.getMiddlewares(target, "theMethod");
        Chai.expect(result[0]()).eq("Method")
    })

    it("Should return empty array if provided null", () => {
        let result = <Function[]>ExpressMetaData.getMiddlewares(null);
        Chai.expect(result.length).eq(0)
    })
})