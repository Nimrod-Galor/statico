import passport from 'passport'

/*  Login POST  */
export function auth_post_login(req, res, next){
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  })(req, res, next)
}

/*  Login GET */
export function auth_get_login(req, res, next){
    res.render('login', { user: null })
}

/*  Logout  */
export function auth_logout(req, res, next) {
    req.logout(function(err) {
      if (err) {
        return next(err)
      }
      res.redirect('/admin')
    })
}

/*  Gignup GET  */
export function auth_get_signup(req, res, next) {
    res.render('signup')
}
/*  Signup POST */
export async function auth_post_singup(req, res, next) {
  try{
    if(req.crud_response.messageType === 'success'){
      // user creater successfuly
      req.session.messages = [req.crud_response.messageBody]
      req.session.messageType = req.crud_response.messageType
      req.session.messageTitle = req.crud_response.messageTitle
      res.redirect('/login')
    }else{
      // error
      req.localse.messages = [req.crud_response.messageBody]
      req.localse.messageType = req.crud_response.messageType
      req.localse.messageTitle = req.crud_response.messageTitle
      res.render('signup')
    }
  }catch(err){
  console.error(err)
  return next(err)
  }
}