import { internal, Controller } from "kamboja"
import * as Model from "../model/user-model"

export class UserController extends Controller {
    index(){
        return this.view()
    }
}