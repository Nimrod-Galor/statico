import passport from 'passport'
import crypto from 'crypto'
import {createRow, deleteRow, deleteRows} from '../db.js'

/*  Login POST  */
export function auth_post_login(req, res, next){
  passport.authenticate('local', (err, user, info) => {
    // successReturnToOrRedirect: '/',
    // failureRedirect: '/login',
    // failureMessage: true


  if (err) {
    return next(err)
  }
  if (!user) {
    return res.redirect('/login')
  }

  // Clear all old tokens for this user before generating a new one
  try{
    deleteRows('RememberMeToken', {userId: user.id})
  }catch(err){
    return next(err)
  }
    
  req.logIn(user, (err) => {
    if (err) {
      return next(err)
    }

    if (req.body.remember) {
      const token = crypto.randomBytes(32).toString('hex')

      try{
        const newToken = createRow('RememberMeToken', { token, userId: req.user.id })
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        return res.redirect('/'); // Redirect to the home page
      }catch(err){
        return next(err)
      }
    }else{
      return res.redirect('/'); // Redirect to the home page
    }
    
  })
  })(req, res, next)
}


/*  Logout  */
export async function auth_logout(req, res, next) {
  // clear remember me coockie
  res.clearCookie('remember_me')
  // delete remember me token
  try{
    await deleteRow('RememberMeToken', {userId: req.user.id})
  }catch(err){
    // no token do nothing
  }
  finally{
    req.logout(function(err) {
      if (err) {
        return next(err)
      }
      res.redirect('/admin')
    })
  }
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