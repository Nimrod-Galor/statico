import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import bodyParser from 'body-parser'
import  { listContent,
    createUser, editUser, deleteUser,
    createPage, editPage, deletePage,
    createPost, editPost, deletePost,
    editComment, deleteComment,
    editeRole,
    bulkDelete, bulkPublish
} from '../controllers/crudController.js'
import {initialize} from '../setup/initialize.js'
import {admin_dashboard} from '../controllers/adminController.js'
import {allRolesPermissions} from '../controllers/permissionsController.js'
import {ensureAuthorized, filterByPermissions, isAuthorized} from '../admin/permissions/permissions.js'
import {sendVerificationMailMiddleware} from '../controllers/mailController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router()

function setAlertMessage(req, res, next){
    //  Set alert message
    req.session.messages = Array.isArray(req.crud_response.messageBody) ? req.crud_response.messageBody : [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}

// list Users
router.get(["/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('user', 'list', '/'), filterByPermissions('user'), listContent('user'), admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/user`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'create'), urlencodedParser, createUser, setAlertMessage, sendVerificationMailMiddleware, (req, res) => {
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
    const baseUrl = `${req.baseUrl}/page`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
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
// bulk delete
router.post("/page/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'delete'), urlencodedParser, bulkDelete('page'), setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//bulk publish
router.post("/page/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'edit'), urlencodedParser, bulkPublish('page', true), setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})
//bulk unpublish
router.post("/page/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'edit'), urlencodedParser, bulkPublish('page', false), setAlertMessage, (req, res) => {
    res.redirect('/admin/page')
})

// list Posts
router.get(["/", "/post", "/post?/*"], ensureLoggedIn('/login'), ensureAuthorized('post', 'list', '/'), filterByPermissions('post'), listContent('post'), admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/post`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
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
// bulk delete
router.post("/post/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'delete'), urlencodedParser, bulkDelete('post'), setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//bulk publish
router.post("/post/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'edit'), urlencodedParser, bulkPublish('post', true), setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})
//bulk unpublish
router.post("/post/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'edit'), urlencodedParser, bulkPublish('post', false), setAlertMessage, (req, res) => {
    res.redirect('/admin/post')
})


// list Comments
router.get(["/comment", "/comment?/*"], ensureLoggedIn('/login'), ensureAuthorized('comment', 'list', '/'), filterByPermissions('comment'), listContent('comment'), admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/comment`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'edit'), urlencodedParser, editComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})
// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'delete'), urlencodedParser, deleteComment, setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})
// bulk delete
router.post("/comment/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'delete'), urlencodedParser, bulkDelete('comment'), setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})
//bulk publish
router.post("/comment/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'edit'), urlencodedParser, bulkPublish('comment', true), setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})
//bulk unpublish
router.post("/comment/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'edit'), urlencodedParser, bulkPublish('comment', false), setAlertMessage, (req, res) => {
    res.redirect('/admin/comment')
})

// list Roles
router.get(["/role", "/role?/*"], ensureLoggedIn('/login'), ensureAuthorized('role', 'list', '/'), filterByPermissions('role'), listContent('role'), admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/role`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
// Edit Role
router.post("/edit/role", ensureLoggedIn('/login'), ensureAuthorized('role', 'edit'), urlencodedParser, editeRole, setAlertMessage, (req, res) => {
    res.redirect('/admin/role')
})

// Permission Page
router.get("/permissions",  ensureLoggedIn('/login'), ensureAuthorized('permissions_page', 'view'), admin_dashboard('permissions'), allRolesPermissions, (req, res) => {
    res.render('permissions', {user: req.user, caption: '' })
})


// get content (list content for dashboard)
// router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), ensureAuthorized('admin_page', 'view', '/'), listContent(), admin_dashboard(), (req, res) => {
//     res.render('dashboard', {user: req.user, caption: '' })
// })


// initial Setup
router.post("/setup",urlencodedParser, initialize, setAlertMessage, (req, res) => {
    res.redirect('/login')
    // if(req.crud_response.messageType === 'success'){
    // }else{// error
    //     res.locals.message = results.message;
    //     res.locals.error = req.app.get('env') === 'development' ? results : {};

    //     // render the error page
    //     res.status(results.status || 500);
    //     res.render('error');
    // }


    // res.locals.permissions = {"admin_page": {
    //         "view": isAuthorized("admin_page", "view", req.user?.roleId)
    //     }
    // }
    // res.render('page', {user: req.user })
})

export default router