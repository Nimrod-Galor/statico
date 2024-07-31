import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import bodyParser from 'body-parser'
import {api_createUser, api_editUser} from '../controllers/apiController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
// create application/x-www-form-urlencoded parser
// const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router()



// Create new user
router.post("/create/user", ensureLoggedIn('/login'), api_createUser)


// Edit user
router.post("/edit/user", ensureLoggedIn('/login'), api_editUser)


export default router