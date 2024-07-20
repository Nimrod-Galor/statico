import express from 'express'
import ensureLogIn from 'connect-ensure-login'
const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()

router.get("/", ensureLoggedIn('/login'), (req, res) => {
    res.send("User list")
})

export default router