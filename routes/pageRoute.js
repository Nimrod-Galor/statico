import express from 'express'
import createError from 'http-errors'
import {findUnique} from '../db.js'
// import {get_index, get_postById, get_postBySlug} from '../controllers/pageController.js'

const router = express.Router();

async function getPage(req, res, next){
    try{
        //  Get post data
        const pageData = await findUnique('page', {slug: 'home'})
        if(!pageData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        res.render('page', { user: req.user, pageData })
    }catch(err){
        console.log(err)
        // post not found
        return next(err);
    }
}

router.get(['/', '/home'], getPage)

export default router