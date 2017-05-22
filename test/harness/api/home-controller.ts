import { Controller, response } from "../../../src"


export class HomeController extends Controller {
    index() {
        return response.view()
    }
}