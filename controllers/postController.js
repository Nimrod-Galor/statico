import createError from 'http-errors'
import he from 'he'
import { findUnique, readRows, countRows} from '../db.js'
import { isAuthorized } from '../statico/permissions/permissions.js'

export async function post_search(req, res, next){
    const { search } = req.body
    
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
        "skip": req.query.page ? (req.query.page - 1) * 10 : 0,
        "take": 10,
        where,
        select
    }
    
    try{
        const documentsCount = await countRows('post', where)

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

        const numberOfPages = Math.ceil(documentsCount / 10)
        const currentPage = parseInt(req.query.page) || 1

        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        res.render('search_results', { user: req.user, results, documentsCount, numberOfPages, currentPage })
    }catch(err){
        console.log(err.message)
        next(err)
    }
}

export function get_index(req, res){
    const postData = {}
    res.render('index', { user: req.user, postData })
}

export async function get_postById(req, res, next){
    const postId = req.params.postId

    try{
        //  Get post data by id
        const postData = await findUnique('post', {id: postId})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        postData.body = he.decode(postData.body)

        res.render('post', { user: req.user, postData })
    }catch(err){
        return next(err);
    }

}

export async function get_postBySlug(req, res, next){
    const slug = req.params.slug

    try{
        //  Get post data by slug
        const postData = await findUnique('post', {slug})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        postData.body = he.decode(postData.body)
        res.render('post', { user: req.user, postData })
    }catch(err){
        return next(err);
    }
}

