import { ApiController, val, http } from "kamboja"

export class CategoriesController extends ApiController {
    get( @val.required() id) {
        return id
    }

    list(iOffset = 1, iLimit = 10, query = "") {
        return { offset: iOffset, limit: iLimit, query: query }
    }

    add(model) {
        return model
    }

    replace(id, model) {
        return model
    }

    modify( @val.required() id, model) {
        return model
    }

    delete( @val.required() id) {
        return id
    }
}

@http.root("categories/:categoryId/items")
export class CategoriesItemController extends ApiController {
    get( @val.required() id, @val.required() categoryId) {
        return { id: id, categoryId: categoryId }
    }

    list( @val.required() categoryId, iOffset = 1, iLimit = 10, query = "") {
        return { offset: iOffset, limit: iLimit, query: query, categoryId: categoryId }
    }

    add(model, @val.required() categoryId) {
        model.categoryId = categoryId
        return model
    }

    replace(id, model, @val.required() categoryId) {
        model.categoryId = categoryId
        return model
    }

    modify( @val.required() id, model, @val.required() categoryId) {
        model.categoryId = categoryId
        return model
    }

    delete( @val.required() id, @val.required() categoryId) {
        return { id: id, categoryId: categoryId }
    }
}