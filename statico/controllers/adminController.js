import initialize from '../setup/initialize.js'
import createError from 'http-errors'
// import createUser from '../../modules/createUser.js'
import isValid from '../admin/theme/scripts/validations.js'
import modelsInterface from '../interface/modelsInterface.js'
import {readRows, countsRows} from '../../db.js'

// get name of all models
const modelsName = modelsInterface.map(item => item.name)

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
    // get selected content type name
    const contentType = req.params.contentType.toLowerCase() || modelsInterface[0].name.toLowerCase()

    

    // check we didnt get here by mistake
    if(!modelsName.includes(capitalizeFirstLetter(contentType))){
        next(createError(404, 'Resource not found'))
    }

    //  Get roles
    const roles = await readRows('role', {select:{ id: true, name: true}})

    // count models
    const counts = await countsRows(modelsName)
    // update counts in models list
    for(let i=0; i< counts.length; i++){
        modelsInterface[i].count = counts[i]
    }

    // get selected model
    const selectedModel = modelsInterface.find((model) => model.name.toLowerCase() == contentType.toLowerCase())

    // build models data query string
    const where = {}
    // const orderBy = {}
    if(req.params[0]){
        // check for extra parmas
        const paramsArr = req.params[0].split('/')
        for(let i=0; i<paramsArr.length;i++){
            const param = paramsArr[i]
            // check if param of type filter 
            const filter = selectedModel.filters.find(f => f.name == param)
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
        "select": selectedModel.select,
        "orderBy": {}
    }
    //  Get models data
    let modelsData = await readRows(contentType, query)
    // destruct nested fields
    if(selectedModel.destructur){
        modelsData = modelsData.map(selectedModel.destructur)
    }
    // set models meta data
    const metaData = modelsInterface.reduce((res, item) => {
            res.push({
                "name": item.name.toLowerCase(),
                "header": item.header,
                "count": item.count,
                "selected": item.name.toLowerCase() == contentType,
                "fields": `"${JSON.stringify(item.fields)}"`
            });
            return res;
    }, [])
    
    const modelHeaders = selectedModel.fields
    
    res.render('dashboard', {user: req.user, metaData, contentType, modelsData, modelHeaders, roles, caption: '' })
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