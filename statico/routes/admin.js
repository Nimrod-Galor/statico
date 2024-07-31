import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import bodyParser from 'body-parser'
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

export default router