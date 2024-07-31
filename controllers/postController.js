import createError from 'http-errors'
import {findUnique} from '../db.js'

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

        res.render('post', { user: req.user, postData })
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }

}

export async function get_postBySlug(req, res, next){
    const slug = req.params.slug

    try{
        //  Get post data
        const postData = await findUnique('post', {slug})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        res.render('post', { user: req.user, postData })
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }
}