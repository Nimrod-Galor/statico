import createError from 'http-errors'
import permissions from './permissions.json' assert { type: "json" }

export function isAuthorized(contentType, key, roleId){
    try{
        return permissions[roleId][contentType][key].allow
    }catch(err){
        return false
    }
}

export function ensureAuthorized(contentType, key, redirect = '/'){
    return function(req, res, next){
        if(isAuthorized(contentType, key, req.user.roleId)){
            next()
        }else{
            next(createError(403, `You are not authorized to view this page! ("${req.originalUrl}")`, {messages: `You are not authorized to view this page! ("${req.originalUrl}")`, messageType: 'warning', messageTitle: 'Forbidden'}))
        }
    }
}

export function filterByPermissions(contentType){
    return function(req, res, next){
        try{
            let where = {}
            if("authorId" in permissions[req.user.roleId][contentType].list.where){
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

export function getRolePermissions(roleId){
    return structuredClone(permissions[roleId])
}