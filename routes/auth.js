import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import ensureLogIn from 'connect-ensure-login'

import getBy, {createRow} from '../db.js'


const router = express.Router();


async function authenticateUser(email, password, done) {
  try{
    const user = await getBy('user', {email})
    
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

passport.use(new LocalStrategy({usernameField: 'email'},
  authenticateUser
))



/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username
 * information is stored in the session.
 */
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.userName })
    })
})
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user)
    })
})

/** GET /login */
router.get('/login', ensureLogIn.ensureLoggedOut('/'), function(req, res, next) {
    res.render('login')
})

/** POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
  */
router.post('/login', passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  }))
  
/* POST /logout
 *
 * This route logs the user out.
 */
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})


/* GET /signup
 *
 * This route prompts the user to sign up.
 *
 * The 'signup' view renders an HTML form, into which the user enters their
 * desired username and password.  When the user submits the form, a request
 * will be sent to the `POST /signup` route.
 */
router.get('/signup', function(req, res, next) {
  res.locals.title = 'Signup'
  res.locals.action = '/signup'
  res.render('signup')
})

/* POST /signup
*
* This route creates a new user account.
*
* A desired username and password are submitted to this route via an HTML form,
* which was rendered by the `GET /signup` route.  The password is hashed and
* then a new user record is inserted into the database.  If the record is
* successfully created, the user is logged in.
*/
router.post('/signup', async function(req, res, next) {
  const { email, userName, password } = req.body

  // validate data
  const isValidPassword = /^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/
  const isValidUserName = /^([a-zA-Z0-9_\-\.]).{4,12}$/
  const isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  
  if( !isValidEmail.test(email) || 
      !isValidUserName.test(userName) || 
      !isValidPassword.test(password) ){
    return next(err)
  }

  try{
    // check if use exist
    try{
      const existsUser = await getBy('user', {email})
      // console.log('existsUser', existsUser)
      if(existsUser){// user exist
        // res.locals.message = {"type": 'warning',
        //   "title": 'An account with that email address already exists.',
        //   "body": '<p>Please log in to continue.</p>'}

        res.locals.messages = ['An account with that email address already exists. Please log in to continue.']
        res.locals.hasMessages = true
          
        res.render('signup')

        // req.session.messages.push('An account with that email address already exists. Please log in to continue.')
        // res.redirect('/login')
        return
      }
    }catch(err){
      // Error: NotFoundError: No User found
      // this is good. continue script...
    }

    // get subscriber role
    const subscriberRole = await getBy('role', {"name": 'subscriber'})

    // create new user
    const tmpUser = {
      email,
      password,
      salt: crypto.randomBytes(16),
      userName,
      role: {
          connect: {id: subscriberRole.id}
        }
    }

    const key = crypto.pbkdf2Sync(tmpUser.password, tmpUser.salt, 100000, 64, 'sha512');
    tmpUser.password = key.toString('hex')
    // crypto.pbkdf2(tmpUser.password, tmpUser.salt, 310000, 32, 'sha256', function(err, derivedKey) {
    //     tmpUser.password = derivedKey.toString('hex')
    // })

    tmpUser.salt = tmpUser.salt.toString('hex')

    const user = await createRow('user', tmpUser)
    
    // res.locals.message = {
    //   "type": 'success',
    //   "title": 'Your account has been successfully created.',
    //   "body": '<p>An email with a verification code was just sent to: ' + user.email + '</p>'
    // }

    res.locals.messages = ['Your account has been successfully created. An email with a verification code was just sent to: ' + user.email]
    res.locals.hasMessages = true
    // res.redirect('/login')
    res.render('index')

  }catch(err){
    console.error(err)
    return next(err)
  }
})

export default router