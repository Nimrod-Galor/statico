import 'dotenv/config'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import {readRow} from './db.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import logger  from 'morgan'


// routes
import pageRouter from './routes/pageRoute.js'
import postRouter from './routes/postRoute.js'
import authRouter from './routes/authRoute.js'
import adminRouter from './statico/routes/adminRoute.js'
import apiRouter from './statico/routes/apiRoute.js'
import jsonAlerts from './statico/routes/jsonalerts.js'


/* Test prisma */
// import getBy, {createRow} from './db.js'

// getBy('role', {"name": "subscriber2"})
// .then((role) => console.log('test prisma', role))
// .catch((err) => console.error('test prisma err', err))
/* Test prisma END*/

const app = express()

// view engine setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'statico/admin/theme/views')])
app.set('view engine', 'ejs')


// MIddleWare
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
// public
app.use(express.static(path.join(__dirname, 'public')))
// admin
app.use(express.static(path.join(__dirname, 'statico/admin/theme')))
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL })//'mongodb://localhost/test-app'
}))
app.use(passport.authenticate('session'))



async function authenticateUser(email, password, done) {
    try{
        // const user = await getBy('user', {email})
        const user = await readRow('user', {where:{email}})

        if (email != user.email) {
            return done(null, false, { message: 'Incorrect username or password.' })
        }

        const newPassword = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 100000, 64, 'sha512')
        const oldPassword = Buffer.from(user.password, 'hex')

        if (!crypto.timingSafeEqual(oldPassword, newPassword)) {
            return done(null, false, { message: 'Incorrect username or password.' })
        }

        return done(null, user)

    }catch(err){//NotFoundError: No User found
        return done(null, false, { message: 'Incorrect username or password.' })
    }
}
  
passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.userName, roleId: user.roleId })
    })
})

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user)
    })
})







// Session-persisted message middleware
app.use(function(req, res, next) {
    var msgs = req.session.messages || [];
    var mtype = req.session.messageType || 'info'
    var title = req.session.messageTitle || ''
    res.locals.messages = msgs;
    res.locals.messageTitle = title
    res.locals.messageType = mtype
    res.locals.hasMessages = !! msgs.length
    req.session.messages = []
    req.session.messageTitle = ''
    next();
});

// Session-persisted message middleware
// app.use(function(req, res, next){
//     var err = req.session.error
//     var msg = req.session.success
//     delete req.session.error
//     delete req.session.success
//     res.locals.message = ''
//     if (err){
//         res.locals.message = err
//     }
//     if (msg){
//         res.locals.message = '<p class="msg success">' + msg + '</p>'
//     }
//     next()
// })

// Routes
app.use('/api', apiRouter)
app.use('/admin', adminRouter)
app.use('/', pageRouter)
app.use('/', authRouter)
app.use('/', postRouter)
app.use('/json-alert', jsonAlerts)

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
    res.render('error', { user: req.user });
})


// module.exports  = app

export default app
