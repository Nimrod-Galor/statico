 
import permissions from '../admin/permissions/permissions.json' assert { type: "json" }
import {readRows} from '../../db.js'

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