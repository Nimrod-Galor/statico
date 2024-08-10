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
router.get(["/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('admin_page', 'view', '/'), filterByPermissions('user'), listContent('user'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'create'), urlencodedParser, createUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'edit'), urlencodedParser, editUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Delete User
router.post("/delete/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'delete'), urlencodedParser, deleteUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})

// list Pages
router.get(["/page", "/page?/*"], ensureLoggedIn('/login'), ensureAuthorized('page', 'list', '/'), filterByPermissions('page'), listContent('page'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'create'), urlencodedParser, createPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Edit Page
router.post("/edit/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'edit'), urlencodedParser, editPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Delete Page
router.post("/delete/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'delete'), urlencodedParser, deletePage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})

// list Posts
router.get(["/", "/post", "/post?/*"], ensureLoggedIn('/login'), ensureAuthorized('admin_page', 'view', '/'), filterByPermissions('post'), listContent('post'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'create'), urlencodedParser, createPost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'edit'), urlencodedParser, editPost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//  Delete Post
router.post("/delete/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'delete'), urlencodedParser, deletePost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})

// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'edit'), urlencodedParser, editComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})

// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'delete'), urlencodedParser, deleteComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})

// Edit Role
router.post("/edit/role", ensureLoggedIn('/login'), ensureAuthorized('role', 'edit'), urlencodedParser, editeRole, setAlertMessage, (req, res) => {
    res.redirect('/admin/role')
})

// Permission Page
router.get("/permissions",  ensureLoggedIn('/login'), ensureAuthorized('permissions_page', 'view'), admin_dashboard('permissions'), getPermissions, (req, res) => {
    res.render('permissions', {user: req.user, caption: '' })
})


// get content (list content for dashboard)
router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), ensureAuthorized('admin_page', 'view', '/'), listContent(), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})


// initial Setup
router.post("/setup",urlencodedParser, admin_post_setup)

export default router