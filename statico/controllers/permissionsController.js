 
import permissions from '../permissions/permissions.json' assert { type: "json" }
import { getRolePermissions } from '../permissions/permissions.js'
import { readRows } from '../../db.js'

export function setRoleLocalsPermissions(req, res, next){
    // Get permissions
    const permissions = getRolePermissions(req.user.roleId)
    // update authorId -> user.id with current user id
    for (const [contentType, typePermissions] of Object.entries(permissions)) {
        for (const [key, operation] of Object.entries(typePermissions)) {
            if("where" in operation && "authorId" in operation.where){
                operation.where.authorId = req.user.id
            }
        }
    }

    res.locals.permissions = permissions
    next()
}

export async function allRolesPermissions(req, res, next){
    const rolesOrder = {
        "admin": 0,
        "editor": 1,
        "author": 2,
        "contributor": 3,
        "subscriber": 4,
    }
    // get roles
    const roles = await readRows('role', {select: {id: true, name: true, description: true}})
    res.locals.roles = roles.sort((a,b) => rolesOrder[a.name] < rolesOrder[b.name] ? -1 : 1)
    res.locals.permissions = permissions
    
    // set admin role id
    res.locals.adminRoleId = getAdminRoleId()
    next()
}

function getAdminRoleId(){
    let maxKeys = 0
    let objIndex = 0
    for(let i =0; i < permissions.length; i++){
        const objLength = Object.keys(permissions[i]).length
        if(objLength > maxKeys){
            maxKeys = objLength
            objIndex = 1
        }
    }

    return Object.keys(permissions)[objIndex]
}