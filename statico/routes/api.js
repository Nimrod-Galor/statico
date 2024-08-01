import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import bodyParser from 'body-parser'
import  {   api_createUser, api_editUser, api_deleteUser,
            api_createPage, api_editPage, api_deletePage,
            api_createPost, api_editPost, api_deletePost
        } from '../controllers/apiController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()

//  Create User
router.post("/create/user", ensureLoggedIn('/login'), api_createUser)
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), api_editUser)
//  Delete User
router.delete("/delete/user", ensureLoggedIn('/login'), api_deleteUser)

//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), api_createPage)
//  Edit Page
router.post("/edit/post", ensureLoggedIn('/login'), api_editPage)
//  Delete Page
router.delete("/delete/page", ensureLoggedIn('/login'), api_deletePage)

//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), api_createPost)
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), api_editPost)
//  Delete Post
router.delete("/delete/post", ensureLoggedIn('/login'), api_deletePost)

export default router