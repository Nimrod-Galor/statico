// import { initialize } from '../setup/initialize.js'
import modelsInterface from '../interface/modelsInterface.js'
import { countsRows } from '../../db.js'
import { isAuthorized, getPermissionFilter, getRolePermissions } from '../admin/permissions/permissions.js'

// get name of all models
const modelsName = Object.keys(modelsInterface)//modelsInterface.map(item => item.name.toLowerCase())

/*  Setup   */
// export async function admin_post_setup(req, res){
//     let {email, emailverified, password, username} = req.body

//     emailverified = !! emailverified
//     // sanitize ** todo
//     // initialize statico
//     const results = await initialize(email, emailverified, password, username)

//     if(results.success){
//         req.session.messages = results.message
//         req.session.messgaeTitle = 'Success'
//         req.session.messageType = 'success'
//         res.redirect('/login')
//     }else{// error
//         res.locals.message = results.message;
//         res.locals.error = req.app.get('env') === 'development' ? results : {};

//         // render the error page
//         res.status(results.status || 500);
//         res.render('error');
//     }
// }





/** Get Content */
export function admin_dashboard(contentType){
    return async function(req, res, next){
        // check for errors
        if(req.crud_response && req.crud_response.messageType != 'data'){
            res.locals.messages = [req.crud_response.messageBody];
            res.locals.messageTitle = req.crud_response.messageTitle
            res.locals.messageType = req.crud_response.messageType
            res.locals.hasMessages = true
        }

        // count number of documents for every collection (model)
        // const documentsCount = await countsRows(modelsName)
        const countModels = []
        const countSelectes = []
        for(let i = 0; i <modelsName.length; i++){
            if(isAuthorized(modelsName[i], 'list', req.user.roleId)){
                countModels.push(modelsName[i])
                
                countSelectes.push(getPermissionFilter(modelsName[i], req.user))
            }
        }
        const documentsCount = await countsRows(countModels, countSelectes)

        // update counts in models list
        for(let i=0; i< documentsCount.length; i++){
            modelsInterface[modelsName[i]].count = documentsCount[i]
        }

        // Set sidebat data
        const sidebarData = {}
        for (const [key, interFace] of Object.entries(modelsInterface)) {
            // sidebarData[key] = (({ displayName, count, selectFields }) => ({ displayName, count, selectFields }))(modelsInterface[key]);
            const tmpObj = (({ displayName, count, selectFields }) => ({ displayName, count, selectFields }))(interFace);
            // destruct nested fields
            if('destructur' in interFace){
                tmpObj.selectFields = interFace.destructur(tmpObj.selectFields)
                // sidebarData[key].selectFields = interFace.destructur({[req.contentType]: interFace.selectFields})
            }
            
            tmpObj.selectFields = Object.keys(tmpObj.selectFields)
            tmpObj.selected = key === req.contentType

            sidebarData[key] = tmpObj
        }

        
        res.locals.sidebarData = sidebarData
        res.locals.modelHeaders = req.selectedModel?.displayFields || []
        res.locals.modelsData = req.modelsData || []
        res.locals.contentType = req.contentType || contentType || ''
        res.locals.numberOfPages = (req.contentType in sidebarData) ? Math.ceil(sidebarData[req.contentType].count / 10) : 0
        res.locals.currentPage = parseInt(req.query.page) || 1
        
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
}

// function stringToBoolean(str){
//     if(str === "true"){
//         return true
//     }else if(str === "false"){
//         return false
//     }
//     return undefined
// }

// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1);
// }