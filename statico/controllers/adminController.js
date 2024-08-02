import initialize from '../setup/initialize.js'
import createError from 'http-errors'
// import createUser from '../../modules/createUser.js'
import isValid from '../admin/theme/scripts/validations.js'
import modelsInterface from '../interface/modelsInterface.js'
import {readRows, countsRows} from '../../db.js'

const roles = await readRows('role', {select:{ id: true, name: true}})

// get name of all models
const modelsName = modelsInterface.map(item => item.name)
// count models rows
const counts = await countsRows(modelsName)
// update counts in models list
for(let i=0; i< counts.length; i++){
    modelsInterface[i].count = counts[i]
}

/*  Setup   */
export async function admin_post_setup(req, res){
    let {email, emailverified, password, username} = req.body

    emailverified = !! emailverified
    // sanitize ** todo
    // initialize statico
    const results = await initialize(email, emailverified, password, username)

    if(results.success){
        req.session.messages = [results.message]
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
        res.render('error', {user: req.user, modelsInterface, contentType, modelData, modelHeaders: model.fields, roles });
    }
}





/** Get Content */
export async function admin_get_content(req, res, next){
    ///:contentType?/*
    // get selected content type name
    const contentType = req.params.contentType || modelsInterface[0].name.toLowerCase()
    // check we didnt get here by mistake
    if(!modelsName.includes(capitalizeFirstLetter(contentType))){
        try{
            const err = createError(404, 'Resource not found');
            throw err;
        } catch (err) {
            next(err); // Pass the error to the Express error handler
        }
        return
    }
    // get selected model
    const model = modelsInterface.find((model) => model.name.toLowerCase() == contentType.toLowerCase())
    // check for extra parmas
    const where = {}
    // const orderBy = {}
    if(req.params[0]){
        const paramsArr = req.params[0].split('/')
        for(let i=0; i<paramsArr.length;i++){
            const param = paramsArr[i]
            // check if param of type filter 
            const filter = model.filters.find(f => f.name == param)
            if(filter){
                let filterOn = paramsArr[++i]
                // check if filteron is valid
                if(isValid(filterOn, filter.type)){
                    if(filter.type === "BooleanString"){
                        filterOn = stringToBoolean(filterOn)
                    }
                    // set filter
                    where[filter.key] = filterOn
                }
            }
        }
    }

    const query = {
        "skip": req.query.page ? (req.query.page - 1) * 10 : 0,
        "take": 10,
        where,
        "select": model.select,
        "orderBy": {}
    }
    
    let modelData = await readRows(contentType, query)

    if(model.destructur){
        modelData = modelData.map(model.destructur)
    }

    res.render('dashboard', {user: req.user, modelsInterface, contentType, modelData, modelHeaders: model.fields, roles })
    

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