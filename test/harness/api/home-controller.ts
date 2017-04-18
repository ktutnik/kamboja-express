import { internal, Controller } from "kamboja"


export class HomeController extends Controller {
    index() {
        return this.view()
    }
}