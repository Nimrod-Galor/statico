import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import ensureLogIn from 'connect-ensure-login'

import getBy, {createRow} from '../db.js'



// // create super administrator user
// const superUser = {
//   email : 'admin@admin.com',
//   password: 'admin',
//   salt: crypto.randomBytes(16),
//   userName: 'administrator',
//   role: {
//     connect: {id: '669cc898fa925b0b2cd1d129'}
//   }
// }

// crypto.pbkdf2(superUser.password, superUser.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//   superUser.password = hashedPassword
// })

// superUser.salt = superUser.salt.toString('hex')

// const superAdminUser = await createRow('user', superUser)

// console.log('superAdminUser', superAdminUser)


const router = express.Router();

/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
// passport.use(new LocalStrategy(
//     function verify(username, password, cb) {
//     db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
//         if (err) {
//             return cb(err)
//         }
//         if (!row) {
//             return cb(null, false, { message: 'Incorrect username or password.' })
//         }
        
//         crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//             if (err) {
//                 return cb(err)
//             }
//             if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
//                 return cb(null, false, { message: 'Incorrect username or password.' })
//             }
//             return cb(null, row)
//         })
//     })
// }))

const dummyUser = {email: 'test@hotmail.com', password: 'password'}
var salt = crypto.randomBytes(16)
crypto.pbkdf2(dummyUser.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
  dummyUser.hashedPassword = hashedPassword
})


function authenticateUser(email, password, done) {
  
      // if (err) {
      //     return done(err)
      // }
      // if (!row) {
      //     return done(null, false, { message: 'Incorrect username or password.' })
      // }

      if (email != dummyUser.email) {
          return done(null, false, { message: 'Incorrect username or password.' })
      }
      
      crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) {
              return done(err)
          }
          if (!crypto.timingSafeEqual(dummyUser.hashedPassword, hashedPassword)) {
              return done(null, false, { message: 'Incorrect username or password.' })
          }
          return done(null, dummyUser)
      })
  
}

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
  },
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
        cb(null, { id: user.id, username: user.username })
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
router.post('/signup', function(req, res, next) {
  const { email, userName, password } = req.body


  // validate data
  const isValidPassword = /^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/
  const isValidUserName = /^([a-zA-Z0-9_\-\.]).{4,12}$/
  const isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  
  if(!isValidEmail.test(email)
    || !isValidUserName.test(userName)
    || !isValidPassword.test(password)
  ){
    return next(err)
  }


  var salt = crypto.randomBytes(16)
  crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) {
      return next(err)
    }
    // db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    //   req.body.username,
    //   hashedPassword,
    //   salt
    // ], function(err) {
    //   if (err) { return next(err)}
    //   var user = {
    //     id: this.lastID,
    //     username: req.body.username
    //   }
    //   req.login(user, function(err) {
    //     if (err) { return next(err)}
    //     res.redirect('/')
    //   })
    // })
    createUser(email, String(hashedPassword), String(salt), userName)
    .then(user => {
      req.login(user, function(err) {
        if (err) { return next(err)}
        res.redirect('/')
      })
    })
    .catch(async (e) => {
      console.error(e)
      // process.exit(1)
      return next(err)
    })
    
  })
})

export default router