import express from 'express'
import { userValidation, deleteValidation, bulkValidation, postValidation, commentValidation, roleValidation, commentsListValidation, postIdValidation } from '../controllers/formValidations.js'
import ensureLogIn from 'connect-ensure-login'
import  {   listContent, createUser, editUser, deleteUser,
            createPage, editPage, deletePage,
            createPost, editPost, deletePost,
            countComments, listComments, createComment, editComment, deleteComment, likeComment, dislikeComment,
            listRoles, editeRole
        } from '../controllers/crudController.js'
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()

/*  User    */
// List users
router.get(["/users", "users?/*"], ensureLoggedIn('/json-alert/login'), ensureAuthorized('user', 'list'), filterByPermissions('user'), listContent('user'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create User
router.post("/create/user", ensureLoggedIn('/json-alert/login'), ensureAuthorized('user', 'create'), userValidation(), createUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/json-alert/login'), ensureAuthorized('user', 'edit'), userValidation(), editUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete User
router.delete("/delete/user", ensureLoggedIn('/json-alert/login'), ensureAuthorized('user', '_user'), deleteValidation(), deleteUser, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Page    */
// List pages
router.get(["/pages", "pages?/*"], ensureLoggedIn('/json-alert/login'), ensureAuthorized('page', 'list'), filterByPermissions('page'), listContent('post'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create Page
router.post("/create/page", ensureLoggedIn('/json-alert/login'), ensureAuthorized('page', 'create'), postValidation(), createPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Page
router.post("/edit/post", ensureLoggedIn('/json-alert/login'), ensureAuthorized('page', 'edit'), postValidation(), editPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Page
router.delete("/delete/page", ensureLoggedIn('/json-alert/login'), ensureAuthorized('page', 'delete'), deleteValidation(), deletePage, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Post    */
// List posts
router.get(["/posts", "posts?/*"], ensureLoggedIn('/json-alert/login'), ensureAuthorized('post', 'list'), filterByPermissions('post'), listContent('post'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create Post
router.post("/create/post", ensureLoggedIn('/json-alert/login'), ensureAuthorized('post', 'create'), postValidation(), createPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/json-alert/login'), ensureAuthorized('post', 'edit'), postValidation(), editPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Post
router.delete("/delete/post", ensureLoggedIn('/json-alert/login'), ensureAuthorized('post', 'delete'), deleteValidation(), deletePost, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Comment    */
// Count Comments
router.post("/count/comments", postIdValidation(), countComments, (req, res, next) => {
    res.json(req.crud_response)
})
// List Comments
router.post("/comments", commentsListValidation(), listComments, (req, res, next) => {
    res.json(req.crud_response)
})
// Create Comment
router.post("/create/comment", ensureLoggedIn('/json-alert/logintocomment'), ensureAuthorized('comment', 'create'), commentValidation(), createComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/json-alert/logintocomment'), ensureAuthorized('comment', 'edit'), commentValidation(), editComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/json-alert/logintocomment'), ensureAuthorized('comment', 'delete'), deleteValidation(), deleteComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Like Comment
router.post("/like/comment", ensureLoggedIn('/json-alert/logintocomment'), postIdValidation(), likeComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Dislike Comment
router.post("/dislike/comment", ensureLoggedIn('/json-alert/logintocomment'), postIdValidation(), dislikeComment, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Role    */
// List Roles
router.get("/roles", ensureLoggedIn('/json-alert/login'), ensureAuthorized('role', 'list'), filterByPermissions('role'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})
// update role
router.post("/edit/role", ensureLoggedIn('/json-alert/login'), ensureAuthorized('role', 'edit'), roleValidation(), editeRole, (req, res, next) => {
    res.json(req.crud_response)
})

export default router