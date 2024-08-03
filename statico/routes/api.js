import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import bodyParser from 'body-parser'
import  {   createUser, editUser, deleteUser,
            createPage, editPage, deletePage,
            createPost, editPost, deletePost
        } from '../controllers/crudController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()

//  Create User
router.post("/create/user", ensureLoggedIn('/login'), createUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), editUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete User
router.delete("/delete/user", ensureLoggedIn('/login'), deleteUser, (req, res, next) => {
    res.json(req.crud_response)
})

//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), createPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Page
router.post("/edit/post", ensureLoggedIn('/login'), editPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Page
router.delete("/delete/page", ensureLoggedIn('/login'), deletePage, (req, res, next) => {
    res.json(req.crud_response)
})

//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), createPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), editPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Post
router.delete("/delete/post", ensureLoggedIn('/login'), deletePost, (req, res, next) => {
    res.json(req.crud_response)
})

export default router