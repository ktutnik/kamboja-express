import { Controller, results } from "../../../src"


export class HomeController extends Controller {
    index() {
        return results.view()
    }
}