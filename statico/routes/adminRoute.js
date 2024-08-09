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
router.get(["/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), filterByPermissions('list_users'), listContent('user'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), ensureAuthorized('create_user'), urlencodedParser, createUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), ensureAuthorized('edit_user'), urlencodedParser, editUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})
//  Delete User
router.post("/delete/user", ensureLoggedIn('/login'), ensureAuthorized('delete_user'), urlencodedParser, deleteUser, setAlertMessage, (req, res) => {
    res.redirect('/admin/user')
})

// list Pages
router.get(["/page", "/page?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), filterByPermissions('list_pages'), listContent('page'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), ensureAuthorized('create_page'), urlencodedParser, createPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Edit Page
router.post("/edit/page", ensureLoggedIn('/login'), ensureAuthorized('edit_page'), urlencodedParser, editPage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//  Delete Page
router.post("/delete/page", ensureLoggedIn('/login'), ensureAuthorized('delete_page'), urlencodedParser, deletePage, setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})

// list Posts
router.get(["/", "/post", "/post?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), filterByPermissions('list_posts'), listContent('post'), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})
//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), ensureAuthorized('create_post'), urlencodedParser, createPost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), ensureAuthorized('edit_post'), urlencodedParser, editPost, setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//  Delete Post
router.post("/delete/post", ensureLoggedIn('/login'), ensureAuthorized('delete_post'), urlencodedParser, deletePost, setAlertMessage, (req, res) => {
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

// Permission Page
router.get("/permissions",  ensureLoggedIn('/login'), ensureAuthorized('view_permissions_page'), admin_dashboard('permissions'), getPermissions, (req, res) => {
    res.render('permissions', {user: req.user, caption: '' })
})


// get content (list content for dashboard)
router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), ensureAuthorized('view_admin_page', '/'), listContent(), admin_dashboard(), (req, res) => {
    res.render('dashboard', {user: req.user, caption: '' })
})


// initial Setup
router.post("/setup",urlencodedParser, admin_post_setup)

export default router