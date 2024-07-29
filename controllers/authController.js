import passport from 'passport'


import createUser from '../modules/createUser.js'




  
export function auth_post_login(req, res, next){
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  })(req, res, next)
}



export function auth_get_login(req, res, next){
    res.render('login', { user: null })
}

export function auth_logout(req, res, next) {
    req.logout(function(err) {
      if (err) {
        return next(err)
      }
      res.redirect('/admin')
    })
}

export function auth_get_signup(req, res, next) {
    res.locals.title = 'Signup'
    res.locals.action = '/signup'
    res.render('signup', { user: null })
}

export async function auth_post_singup(req, res, next) {
    const { email, userName, password } = req.body
  
    // sanitize ** todo
  
    try{
      //  create new user
      const result = await createUser(email, userName, password)
  
      if(result.user){// success
        req.session.messages = ['Your account has been successfully created. An email with a verification code was just sent to: ' + result.user.email]
        req.session.messageType = 'success'
        res.redirect('/login')
      }else{
        res.locals.messages = result.errorMsg
        res.locals.messageTitle = result.messageTitle
        res.locals.messageType = result.messageType
        res.locals.hasMessages = true
        res.render('signup', {user: undefined})
      }
    }catch(err){
      console.error(err)
      return next(err)
    }
}