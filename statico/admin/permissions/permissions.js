import createError from 'http-errors'
import permissions from './permissions.json' assert { type: "json" }

export function isAuthorized(key, roleId){
    try{
        return permissions[roleId][key].allow
    }catch(err){
        return false
    }
}

export function ensureAuthorized(key, redirect = '/'){
    return function(req, res, next){
        if(isAuthorized(key, req.user.roleId)){
            next()
        }else{
            next(createError(403, `You are not authorized to view this page! ("${req.originalUrl}")`, {messages: `You are not authorized to view this page! ("${req.originalUrl}")`, messageType: 'warning', messageTitle: 'Forbidden'}))
        }
    }
}

export function filterByPermissions(key){
    return function(req, res, next){
        try{
            let where = permissions[req.user.roleId][key].where
            if("authorId" in where){
                where.authorId = req.user.id
            }
            req.where = where
        }catch(err){
            req.where = {id: null}
        }
        finally{
            next()
        }
    }
}