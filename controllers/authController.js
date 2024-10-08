import createError from 'http-errors'
import passport from 'passport'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult, matchedData } from 'express-validator'
import { createRow, deleteRow, deleteRows, findUnique, updateRow } from '../db.js'
import { sendResetPasswordMail } from '../statico/controllers/mailController.js'

/** API login */
export function api_login(req, res, next){
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info ? info.message : 'Login failed' })
    }

    const token = jwt.sign({ id: user.id, username: user.userName, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return res.json({ token })
  })(req, res, next)
}


/*  Login POST  */
export function auth_post_login(req, res, next){
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      //  Set alert message
      req.session.messages = [info.message]
      req.session.messageType = 'warning'
      req.session.messageTitle = 'Alert'
      return res.redirect('/login')
    }

    try{
      // Clear all old tokens for this user before generating a new one
      deleteRows('RememberMeToken', { userId: user.id })
    }catch(err){
      return next(err)
    }
      
    req.logIn(user, async (err) => {
      if (err) {
        return next(err)
      }

      if (req.body.remember) {  
        try{
          const token = crypto.randomBytes(32).toString('hex')
          await createRow('RememberMeToken', { token, userId: req.user.id })
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000 }); // 14 days
          // return res.redirect('/'); // Redirect to the home page
        }catch(err){
          return next(err)
        }
      }

      return res.redirect('/'); // Redirect to the home page
    })
  })(req, res, next)
}

/*  Logout  */
export async function auth_logout(req, res, next) {
  // clear remember me coockie
  res.clearCookie('remember_me')
  try{
    // delete remember me token
    await deleteRow('RememberMeToken', {userId: req.user.id})
  }catch(err){
    // no token do nothing
  }
  finally{
    req.logout(function(err) {
      if (err) {
        return next(err)
      }
      res.redirect('/')
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
      res.locals.messages = [req.crud_response.messageBody]
      res.locals.messageType = req.crud_response.messageType
      res.locals.messageTitle = req.crud_response.messageTitle
      res.render('signup')
    }
  }catch(err){
    return next(err)
  }
}

/*  verify Email*/
export async function verifyEmail(req, res, next){
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUnique('user', { email: decoded.email });

    if (!user || user.verificationToken !== token || user.verificationTokenExpires < Date.now()) {
      return next( createError(400, 'Invalid or expired token') )
    }

    const tmpUser = {
      emailVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined
    }

    await updateRow('user', {id: user.id}, tmpUser)

    // Send Success json
    req.crud_response = {messageBody: `Email verified successfully!`, messageTitle: 'Email Verification', messageType: 'success'}
    next()
  } catch (error) {
    next( createError(500, 'Server error') );
  }
}

/*  forgot password */
export async function forgotPassword(req, res, next){
  const result = validationResult(req);
  if (!result.isEmpty()) {
    //  Send Error json
    req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
    return next()
  }
  //  Get user data
  const {email} = matchedData(req, { includeOptionals: true });

  try{
    const user = await findUnique('user', { email })

    if(!user){
      req.crud_response = {messageBody: 'Incorrect E-mail addres', messageTitle: 'User not found', messageType: 'danger'}
      return next()
    }

    // Generate JWT token with expiration
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Send email with reset link containing the token
    sendResetPasswordMail(user.email, user.userName, resetToken, req.hostname)

    req.crud_response = {messageBody: `Password reset email sent to: "${user.email}"`, messageTitle: 'Email sent', messageType: 'success'}
    next()
  }catch(err){
    next( createError(500, 'Server error') );
  }
}

/* Reset Password */
export async function resetPassword(req, res, next){
  const result = validationResult(req);
  if (!result.isEmpty()) {
    //  Send Error json
    req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
    return next()
  }
  //  Get user data
  const { password } = matchedData(req, { includeOptionals: true })
  const { token } = req.params;

  try{
    // Verify token without needing to check a database
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await findUnique('user', { id: userId } )
    if (!user) {
      req.crud_response = {messageBody: 'User not found', messageTitle: 'User not found', messageType: 'danger'}
      return next()
    }

    // Hash passowrd
    const salt = crypto.randomBytes(16)
    const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

    //  Set new user object
    const tmpUser = {
      password: key.toString('hex'),
      salt: salt.toString('hex')
    }

    //  Update user
    await updateRow('user', { id: userId }, tmpUser)

    // Send Success json
    req.crud_response = {messageBody: `Password ${user.userName} was successfuly updated`, messageTitle: 'Password Updated', messageType: 'success'}
    next()
  }catch(err){
    next( createError(500, 'Server error') );
  }
}