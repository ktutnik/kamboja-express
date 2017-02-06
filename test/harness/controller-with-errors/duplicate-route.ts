import { internal, ApiController, http } from "kamboja"

export class ItemController extends ApiController {
    getItems(){
        return ["Item 1", "Item 2"]
    }

    @http.get("/item/getitems")
    anotherGetItems(){
       return ["Item 1", "Item 2"]
    }
}