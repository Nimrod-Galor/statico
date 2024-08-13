import createError from 'http-errors'
import he from 'he'
import {findUnique} from '../db.js'
import {isAuthorized} from '../statico/admin/permissions/permissions.js'

export function get_index(req, res){
    const postData = {}
    res.render('index', { user: req.user, postData })
}

export async function get_postById(req, res, next){
    const postId = req.params.postId

    try{
        //  Get post data
        const postData = await findUnique('post', {id: postId})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        postData.body = he.decode(postData.body)

        res.render('post', { user: req.user, postData })
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }

}

export async function get_postBySlug(req, res, next){
    const slug = req.params.slug

    res.locals.permissions = {"admin_page": {
            "view": isAuthorized("admin_page", "view", req.user?.roleId)
        }
    }

    try{
        //  Get post data
        const postData = await findUnique('post', {slug})
        if(!postData){
            // try  Get page data
            const pageData = await findUnique('page', {slug})
            if(!pageData){
                // post not found
                return next(createError(404, 'Resource not found'));
            }
            pageData.body = he.decode(pageData.body)
            res.render('page', { user: req.user, pageData })
        }else{
            postData.body = he.decode(postData.body)
            res.render('post', { user: req.user, postData })
        }
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }
}

