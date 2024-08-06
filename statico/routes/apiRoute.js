import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import bodyParser from 'body-parser'
import  {   createUser, editUser, deleteUser,
            createPage, editPage, deletePage,
            createPost, editPost, deletePost,
            countComments, getComment, createComment, editComment, deleteComment, likeComment, dislikeComment,
            listRoles
        } from '../controllers/crudController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()
/*  User    */
//  Create User
router.post("/create/user", ensureLoggedIn('/json-alert/login'), createUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/json-alert/login'), editUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete User
router.delete("/delete/user", ensureLoggedIn('/json-alert/login'), deleteUser, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Page    */
//  Create Page
router.post("/create/page", ensureLoggedIn('/json-alert/login'), createPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Page
router.post("/edit/post", ensureLoggedIn('/json-alert/login'), editPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Page
router.delete("/delete/page", ensureLoggedIn('/json-alert/login'), deletePage, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Post    */
//  Create Post
router.post("/create/post", ensureLoggedIn('/json-alert/login'), createPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/json-alert/login'), editPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Post
router.delete("/delete/post", ensureLoggedIn('/json-alert/login'), deletePost, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Comment    */
// Count Comments
router.post("/count/comments", countComments, (req, res, next) => {
    res.json(req.crud_response)
})
// Get Comments
router.post("/comments", getComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Create Comment
router.post("/create/comment", ensureLoggedIn('/json-alert/logintocomment'), createComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/json-alert/logintocomment'), editComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/json-alert/logintocomment'), deleteComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Like Comment
router.post("/like/comment", ensureLoggedIn('/json-alert/logintocomment'), likeComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Dislike Comment
router.post("/dislike/comment", ensureLoggedIn('/json-alert/logintocomment'), dislikeComment, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Role    */
// get Roles
router.post("/roles", ensureLoggedIn('/json-alert/login'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})

export default router