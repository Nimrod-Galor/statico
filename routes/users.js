import express from 'express'
const router = express.Router()

router.get("/", (req, res) => {
    res.send("User list")
})


router.post("/create", (req, res) => {
    res.send("User create")
})

router.route("/:userName")
    .get((req, res) => {
        res.send(`Get User ${req.params.userName}`)
    })

    .put((req, res) => {
        res.send(`Edit User ${req.params.userName}`)
    })
    
    .delete((req, res) => {
        res.send(`Delete User ${req.params.userName}`)
    })


router.param("userName", (req, res, next) => {
    
    next()
})

export default router