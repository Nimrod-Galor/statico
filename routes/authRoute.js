import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import {createUser} from '../statico/controllers/crudController.js'
import {auth_post_login, auth_logout, auth_post_singup, verifyEmail} from '../controllers/authController.js'
import {sendVerificationMail} from '../statico/controllers/mailController.js'


const router = express.Router();

/** GET /login  */
router.get('/login', ensureLogIn.ensureLoggedOut('/'), (req, res, next) => {
    res.render('login', { user: null })
})

/** POST /login */
router.post('/login', auth_post_login)
  
/** POST /logout */
router.get('/logout', auth_logout)

/** GET /signup  */
router.get('/signup', ensureLogIn.ensureLoggedOut('/'), (req, res, next) => {
    res.render('signup')
})

/* POST /signup */
router.post('/signup', createUser, sendVerificationMail, auth_post_singup)

/*  Email verification  */
router.get('/verify/:token', verifyEmail, (req, res, next) => {
    res.render('page', { user: req.user })
})

export default router