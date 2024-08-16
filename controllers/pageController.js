import createError from 'http-errors'
import he from 'he'
import { validationResult, matchedData } from 'express-validator'
import {findUnique, readRows, countRows} from '../db.js'
import {isAuthorized} from '../statico/permissions/permissions.js'

export async function search_controller(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        // req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next(createError(result.errors.map(err => err.msg).join()))
    }
    //  Get user data
    let { search, page } = matchedData(req, { includeOptionals: true });
    
    try{
        const where = {
            OR: [
                { title: { contains: search } },
                { body: { contains: search } },
                { author: { 
                        userName: {contains: search } 
                    }
                }
            ]
        }

        const documentsCount = await countRows('post', where)
        const numberOfPages = Math.ceil(documentsCount / 10)
        if(page >= numberOfPages){
            page = numberOfPages
        }
        const currentPage = parseInt(page) || 1

        const select = {
            id: true,
            createDate: true,
            slug: true,
            title: true,
            body: true,
            author: {
                select: {
                    userName: true
                }
            }
        }
    
        const query = {
            "skip": page ? (page - 1) * 10 : 0,
            "take": 10,
            where,
            select
        }

        let results = []
        if(documentsCount > 0){
            results = await readRows('post', query)
            for(let i=0; i < results.length; i++){
                if(results[i].title.includes(search) || results[i].title.includes(search)){
                    // result in title or author
                    results[i].body = he.decode(results[i].body).split('</p>')[0].substring(3)
                }else{
                    // result in body
                    results[i].body = he.decode(results[i].body).split('</p>').find(p => p.includes(search)).substring(3)
                }
            }
        }

        

        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        res.render('search_results', { user: req.user, results, documentsCount, numberOfPages, currentPage, search })
    }catch(err){
        console.log(err.message)
        next(err)
    }
}

export async function getPage(req, res, next){
    const slug = req.params.slug || 'home'
    try{
        //  Get page data
        const pageData = await findUnique('page', { slug })
        if(!pageData){
            // page not found. move to next middleware and let post catch this slug.
            return next()
        }

        res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        //unescape body
        pageData.body = he.decode(pageData.body)

        res.render('page', { user: req.user,  pageData })
    }catch(err){
        console.log(err)
        // page not found
        return next(err);
    }
}

export function errorPage(err, req, res, next){
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    if(req.originalUrl.includes('/api/')){
        // return json response
        res.json(err)
    }else{
        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }
        // render Error page
        res.render('error', { user: req.user });
    }
}

export async function profile(req, res, next){
    //  Get user data
    const userData = await findUnique('user', { id: req.user.id }, {
        id: true,
        userName: true,
        createDate: true,
        email: true,
        _count: {
            select: { 
                posts: true,
                comments: true
            }
        },
        role: {
            select: {
                id: true,
                name: true
            }
        }
    })
    if(!userData){
        // user not found.
        return next(createError(404))
    }

    res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }
    res.render('profile', { user: req.user, userData })
}
