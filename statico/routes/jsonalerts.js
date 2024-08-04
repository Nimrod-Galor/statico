import express from 'express'
const router = express.Router()

// log in needed
router.get("/logintocomment", (req, res, next) => {
    res.json({messageBody: 'Please login to comment', messageTitle: 'Alert', messageType: 'warning'})
})

export default router