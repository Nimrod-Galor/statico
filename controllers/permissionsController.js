import {getRolePermissions} from '../admin/permissions/permissions.js'

export function setRolePermissions(req, res, next){
    // Get permissions
    const permissions = getRolePermissions(req.user.roleId)
    // update authorId
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