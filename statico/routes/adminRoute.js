import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import bodyParser from 'body-parser'
import  { listContent,
    createUser, editUser, deleteUser,
    createPage, editPage, deletePage,
    createPost, editPost, deletePost,
    editComment, deleteComment,
    editeRole
} from '../controllers/crudController.js'
import {admin_post_setup, admin_dashboard} from '../controllers/adminController.js'
import {getPermissions} from '../controllers/permissionsController.js'
import {ensureAuthorized, filterByPermissions} from '../admin/permissions/permissions.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router()

function setAlertMessage(req, res, next){
    //  Set alert message
    req.session.messages = [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}

// list Users
router.get(["/:user?", "/:user?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), filterByPermissions('list_users'), listContent, admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
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
router.post("/edit/page", ensureLoggedIn('/login'), urlencodedParser, editPage, setAlertMessage, (req, res) => {
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
    res.redirect('/admin/post')
})
//  Delete Post
router.post("/delete/post", ensureLoggedIn('/login'), urlencodedParser, deletePost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})

// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/login'), urlencodedParser, editComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})
// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/login'), urlencodedParser, deleteComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})

// Edit Role
router.post("/edit/role", ensureLoggedIn('/login'), urlencodedParser, editeRole, setAlertMessage, (req, res) => {
    res.redirect('/admin/role')
})

router.get("/permissions",  ensureLoggedIn('/login'), admin_dashboard('permissions'), getPermissions, (req, res) => {
    res.render('premissions', {user: req.user, caption: '' })
})

// get content (list content for dashboard)
router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), listContent, admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})


// initial Setup
router.post("/setup",urlencodedParser, admin_post_setup)

export default router