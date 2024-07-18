import 'dotenv/config'
import * as fs from 'fs'
import express from 'express'

const app = express()
const PORT = process.env.port | 3000

app.get('/', (req, res) => {
    console.log("here")
    res.send("Hi")
})

app.listen(PORT)