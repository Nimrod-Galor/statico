import express from 'express'

const router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('configuration.html')
})

export default router