import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import {auth_post_login, auth_get_login, auth_logout, auth_get_signup, auth_post_singup} from '../controllers/authController.js'

const router = express.Router();

/** GET /login  */
router.get('/login', ensureLogIn.ensureLoggedOut('/'), auth_get_login)

/** POST /login */
router.post('/login', auth_post_login)
  
/** POST /logout */
router.get('/logout', auth_logout)

/** GET /signup  */
router.get('/signup', auth_get_signup)

/* POST /signup */
router.post('/signup', auth_post_singup)

export default router