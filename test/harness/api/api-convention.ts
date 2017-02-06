import { internal, ApiController } from "kamboja"
import * as Model from "../model/user-model"

class NonExportedController extends ApiController{
    getData(){}
}

export class UserController extends ApiController {
    repository:Model.UserRepository;

    constructor(){
        super()
        this.repository = new Model.UserRepository()
    }

    async getByPage(offset, take) {
        return this.repository.getAll();
    }

    async get(id){
        return this.repository.get(id)
    }

    async add(user){
        await this.repository.add(user)
        return this.repository.getAll()
    }

    async modify(id, user){
        await this.repository.modify(id, user);
        return this.repository.get(id)
    }
}