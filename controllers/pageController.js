import createError from 'http-errors'
import {findUnique} from '../db.js'
import {isAuthorized} from '../statico/admin/permissions/permissions.js'

export async function getPage(req, res, next){
    const slug = req.params.slug || 'home'
    try{
        //  Get page data
        const pageData = await findUnique('page', { slug })
        if(!pageData){
            // page not found
            return next(createError(404, 'Resource not found'));
        }

        res.locals.permissions = {"admin_page": {
                "view": isAuthorized("admin_page", "view", req.user?.roleId)
            }
        }

        res.render('page', { user: req.user,  pageData })
    }catch(err){
        console.log(err)
        // page not found
        return next(err);
    }
}