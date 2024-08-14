import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { getPage, profile } from '../controllers/pageController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn

const router = express.Router();


router.get('/profile', ensureLoggedIn('/login'), profile)

router.get(['/', '/home', '/:slug'],  getPage)

export default router