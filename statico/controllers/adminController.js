import initialize from '../setup/initialize.js'
import createError from 'http-errors'
// import createUser from '../../modules/createUser.js'
import isValid from '../admin/theme/scripts/validations.js'
import modelsInterface from '../interface/modelsInterface.js'
import {readRows, countsRows} from '../../db.js'

// get name of all models
const modelsName = modelsInterface.map(item => item.name.toLowerCase())

/*  Setup   */
export async function admin_post_setup(req, res){
    let {email, emailverified, password, username} = req.body

    emailverified = !! emailverified
    // sanitize ** todo
    // initialize statico
    const results = await initialize(email, emailverified, password, username)

    if(results.success){
        req.session.messages = results.message
        req.session.messgaeTitle = 'Success'
        req.session.messageType = 'success'
        res.redirect('/login')
    }else{// error
        // res.locals.messages = [results.message]
        // res.locals.messgaeTitle = 'Error'
        // res.locals.messageType = 'error'
        // res.render('/error')
        res.locals.message = results.message;
        res.locals.error = req.app.get('env') === 'development' ? results : {};

        // render the error page
        res.status(results.status || 500);
        res.render('error');
    }
}





/** Get Content */
export async function admin_dashboard(req, res, next){
    // check for errors
    if(req.crud_response){
        res.locals.messages = [req.crud_response.messageBody];
        res.locals.messageTitle = req.crud_response.messageTitle
        res.locals.messageType = req.crud_response.messageType
        res.locals.hasMessages = true
    }

    // count models
    const counts = await countsRows(modelsName)
    // update counts in models list
    for(let i=0; i< counts.length; i++){
        modelsInterface[i].count = counts[i]
    }

    // Get sidebat data
    const sidebarData = modelsInterface.reduce((res, item) => {
            res.push({
                "name": item.name,
                "header": item.header,
                "count": item.count,
                "selected": item.name.toLowerCase() == req.contentType,
                "fields": `"${JSON.stringify(item.fields)}"`
            });
            return res;
    }, [])

    //  Get roles
    const roles = await readRows('role', {select:{ id: true, name: true}})

    const modelHeaders = req.selectedModel?.fields || []
    const modelsData = req.modelsData || []
    const contentType = req.contentType || ''
    
    res.render('dashboard', {user: req.user, sidebarData, contentType, modelsData, modelHeaders, roles, caption: '' })
}

function stringToBoolean(str){
    if(str === "true"){
        return true
    }else if(str === "false"){
        return false
    }
    return undefined
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}