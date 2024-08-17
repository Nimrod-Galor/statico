import createError from 'http-errors'
// import permissions from './permissions.json' assert { type: "json" }
import { readFile } from 'fs/promises';

var permissions = {}
readFile("./statico/permissions/permissions.json", "utf8")
.then(data => {
    console.log("reading permisions file")
    permissions = JSON.parse(data)
})
.catch(err => {
    console.log(err)
})

export function updatePermissions(newPermissionsObj){
    permissions = newPermissionsObj
}

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

export function getPermissionFilter(contentType, user){
    try{
        if("authorId" in permissions[user.roleId][contentType].list.where){
            return  {"authorId": user.id}
        }else{
            return permissions[user.roleId][contentType].list.where
        }
    }catch(err){
        return {id: "00a00000a00aa0aaaaa0000a"}
    }
}

export function filterByPermissions(contentType){
    return function(req, res, next){
        try{
            req.where = getPermissionFilter(contentType, req.user)
        }catch(err){
            req.where = {id: "00a00000a00aa0aaaaa0000a"}
        }
        finally{
            next()
        }
    }
}

export function getRolePermissions(roleId){
    return structuredClone(permissions[roleId])
}

export { permissions }