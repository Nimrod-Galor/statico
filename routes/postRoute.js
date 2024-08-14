import express from 'express'
import { post_search, get_index, get_postById, get_postBySlug } from '../controllers/postController.js'

const router = express.Router();

router.post('/post/search', post_search)

router.get('/post/:postId', get_postById)

router.get('/:slug', get_postBySlug)

router.get('/', get_index)

export default router