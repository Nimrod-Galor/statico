import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import bodyParser from 'body-parser'
import  {   createUser, editUser, deleteUser,
    createPage, editPage, deletePage,
    createPost, editPost, deletePost
} from '../middleware/crud.js'
import {admin_post_setup, admin_get_content} from '../controllers/adminController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router()

// initial Setup
router.post("/setup",urlencodedParser, admin_post_setup)

// Create new user
// router.post("/create/user", ensureLoggedIn('/login'), urlencodedParser, admin_post_createUser)

// get content
router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), admin_get_content)
//, "/create/:contentType", "/adit/:contentType", "delete/:contentType"

function setAlertMessage(req, res, next){
    //  Set alert message
    req.session.messages = [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), urlencodedParser, createUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), urlencodedParser, editUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Delete User
router.post("/delete/user", ensureLoggedIn('/login'), urlencodedParser, deleteUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})

//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), urlencodedParser, createPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Edit Page
router.post("/edit/post", ensureLoggedIn('/login'), urlencodedParser, editPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Delete Page
router.post("/delete/page", ensureLoggedIn('/login'), urlencodedParser, deletePage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})

//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), urlencodedParser, createPost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), urlencodedParser, editPost, setAlertMessage, (req, res) => {
    res.redirect('admin/post')
})
//  Delete Post
router.post("/delete/post", ensureLoggedIn('/login'), urlencodedParser, deletePost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})

export default router