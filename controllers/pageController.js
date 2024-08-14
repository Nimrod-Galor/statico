import createError from 'http-errors'
import {findUnique} from '../db.js'
import {isAuthorized} from '../statico/permissions/permissions.js'

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