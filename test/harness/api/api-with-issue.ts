import { internal, ApiController } from "kamboja"

class NonExportedController extends ApiController{
    getData(){}
}

export class ItemController extends ApiController {
    getItems(){
        return ["Item 1", "Item 2"]
    }

    actionThrowsError(){
        throw new Error("Something bad happened")
    }
}