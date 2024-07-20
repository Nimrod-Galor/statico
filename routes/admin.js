import express from 'express'
import ensureLogIn from 'connect-ensure-login'
const router = express.Router()
const ensureLoggedIn = ensureLogIn.ensureLoggedIn

router.get("/", ensureLoggedIn('/login'), (req, res) => {
    res.send("User list")
})

export default router