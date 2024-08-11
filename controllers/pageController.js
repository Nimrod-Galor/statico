import createError from 'http-errors'
import {findUnique} from '../db.js'
import {isAuthorized} from '../statico/admin/permissions/permissions.js'

export async function getPage(req, res, next){
    try{
        //  Get post data
        const pageData = await findUnique('page', {slug: 'home'})
        if(!pageData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        res.locals.permissions = {"admin_page": {
                "view": isAuthorized("admin_page", "view", req.user?.roleId)
            }
        }

        res.render('page', { user: req.user,  pageData })
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }
}