import 'dotenv/config'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import logger  from 'morgan'


import initialize from './statico/initialize.js'

// routes

import pagesRouter from './routes/pages.js'
import userRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'

// In-memory flag
let configurationDone = await isConfigurationDone();
console.log('configurationDone', configurationDone)

const app = express()
const PORT = process.env.port | 3000

// view engine setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


// MIddleWare
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}))
// app.use(passport.session)
app.use(passport.authenticate('session'))
app.use(function(req, res, next) {
  var msgs = req.session.messages?.join('<br>') || []
// var msgs = req.session.messages ? req.session.messages.join('<br>') : ''
  res.locals.messages = {type: 'warning', title: 'Login Failed', body: msgs}
  res.locals.hasMessages = !! msgs.length
  req.session.messages = []
  next()
})

app.use(function(req, res, next){
    var err = req.session.error
    var msg = req.session.success
    delete req.session.error
    delete req.session.success
    res.locals.message = ''
    if (err){
        res.locals.message = err
    }
    if (msg){
        res.locals.message = '<p class="msg success">' + msg + '</p>'
    }
    next()
})

// Routes

app.use('/admin', adminRouter)
app.use('/users', userRouter)
app.use('/', authRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
})


app.listen(PORT)


initialize()