import initialize from '../setup/initialize.js'
import createError from 'http-errors'
import createUser from '../../modules/createUser.js'
import isValid from '../admin/theme/scripts/validations.js'
import prismaModels from '../interface/prismaModels.js'
import {readRows, countsRows} from '../../db.js'

const roles = await readRows('role', {select:{ id: true, name: true}})

// get name of all models
const modelsName = prismaModels.map(item => item.name)
// count models rows
const counts = await countsRows(modelsName)
// update counts in models list
for(let i=0; i< counts.length; i++){
    prismaModels[i].count = counts[i]
}


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
        res.render('error', { user: req.user });
    }
}

export async function admin_post_createUser(req, res){
    let {email, password, username, emailverified, role} = req.body

    // sanitize ** todo

    try{
        //  create new user
        const result = await createUser(email, username, password, emailverified, role)

        if(result.user){// success
            res.locals.messages = ['Your account has been successfully created. An email with a verification code was just sent to: ' + result.user.email]
            res.locals.messgaeTitle = 'Success'
            res.locals.messageType = 'success'
        }else{
            res.locals.messages = result.errorMsg
            res.locals.messageTitle = result.messageTitle
            res.locals.messageType = result.messageType
            res.locals.hasMessages = true
        }
        res.render('/admin')
    }catch(err){
        console.error(err)
        return next(err)
    }
}

export async function admin_get_content(req, res, next){
    ///:contentType?/*
    // get selected content type name
    const contentType = req.params.contentType || prismaModels[0].name.toLowerCase()
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
    const model = prismaModels.find((model) => model.name.toLowerCase() == contentType.toLowerCase())
    // check for extra parmas
    const where = {}
    // const orderBy = {}
    if(req.params[0]){
        const paramsArr = req.params[0].split('/')
        for(let i=0; i<paramsArr.length;i++){
            const param = paramsArr[i]
            // check if param of type filter 
            if(model.filters){
                // check every filter in filters list
                for(let fi=0; fi<model.filters.length; fi++){
                    let filter = model.filters[fi]
                    if(param == filter.name){
                        // we found a filter match
                        let filterOn = paramsArr[++i]
                        // check if filteron is valid
                        if(isValid(filterOn, filter.type)){
                            // set filter
                            where[filter.key] = filterOn
                        }
                        continue;
                    }
                }
            }
        }
    }



    

    //  create Model headers array
    //const modelHeaders = model.fields//.filter((field) => {return field.visible})
    // // get initial Data
    // const skip = req.params.page || 0
    // const take = 10
    // const where = req.query.filter ? createFilter(req.query.filter) : {}
    // const select = getSelectFields(contentType, (field) => {return true})
    // 
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

    res.render('dashboard', {user: req.user, prismaModels, contentType, modelData, modelHeaders: model.fields, roles })
    

}



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}