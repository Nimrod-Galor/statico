import permissions from './statico/admin/permissions/default.permission.json'

export function isAuthorized(key){
    try{
        return permissions[req.user.roleId][key].allow
    }catch(err){
        return false
    }
}

export function filter(key){
    return permissions[req.user.roleId][key].where
}