import * as H from "../../helper"

export interface UserEntity{
    id:number,
    name:string
}

export class UserRepository{
    static instance:UserRepository;
    static getInstance(){
        if(!UserRepository.instance){
            return UserRepository.instance = new UserRepository()
        }
        else return UserRepository.instance;
    }

    private users:UserEntity[] = [{
        id: 1,
        name: "Ketut Sandiarsa"
    }]

    async add(user:UserEntity){
        await H.delay()
        this.users.push(user)
    }

    async get(id:number){
        await H.delay()
        return this.users.filter(x => x.id == id)[0]
    }

    async getAll(){
        await H.delay()
        return this.users;
    }

    async modify(id, modified:UserEntity){
        await H.delay()
        let user = this.users.filter(x => x.id == id)[0]
        user.name = modified.name
    }
}