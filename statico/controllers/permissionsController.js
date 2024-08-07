 
import permissions from '../admin/permissions/permissions.json' assert { type: "json" }
import {readRows} from '../../db.js'

export async function getPermissions(req, res, next){
    // get roles
    res.locals.roles = await readRows('role', {select: {id: true, name: true}})
    // update  role name
    // res.locals.roleName = []
    // for(let i =0; i <roles.length; i++){
    //     res.locals.roleName.push(roles[i].name)
    // }
    // set admin role id
    res.locals.permissions = permissions//Object.entries(permissions)
    // .sort((a,b) => {
    //     if (a[0] < b[0]) {
    //         return -1;
    //     }
    //     if (a[0] > b[0]) {
    //         return 1;
    //     }
    //     return 0;
    // })
    res.locals.adminRoleId = getAdminRoleId(res.locals.permissions)
    next()
}

function getAdminRoleId(pArray){
    let maxKeys = 0
    let objIndex = 0
    for(let i =0; i < pArray.length; i++){
        const objLength = Object.keys(pArray[i]).length
        if(objLength > maxKeys){
            maxKeys = objLength
            objIndex = 1
        }
    }

    return Object.keys(pArray)[objIndex]
}