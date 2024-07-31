import {findUnique, updateRow} from '../../db.js'
import isValid from '../admin/theme/scripts/validations.js'
import crypto from 'crypto'


function userValidations(id, email, username, password, role, emailverified){
    // Validate user Data
    let errorMsg = []

    if(id != undefined){
        if(!isValid(id, "objectid")){
            errorMsg.push('Invalid User')
        }
    }
    if( !isValid(email, "Email")){
        errorMsg.push('Invalid Email address')
    }
    if(!isValid(emailverified, "Boolean")){
        errorMsg.push('Invalid Credentials')
    }
    if(!isValid(username, "UserName")){
        errorMsg.push('Invalid User name')
    }
    if(password != ""){// this field is optional
        if(!isValid(password, "Password")){
            errorMsg.push('Invalid Password')
        }
    }
    if(!isValid(role, "objectid")){
        errorMsg.push('Invalid Role')
    }

    if(errorMsg.length != 0){
        res.json({errorMsg, messageTitle: 'Invalid Credentials', messageType: 'warning'})
        return
    }

    return true
}

/** Create User */
export async function api_createUser(req, res){
    let {email, userName, password, role, emailVerified} = req.body

    // Convert emailverified to boolean
    if(emailVerified === "true"){
        emailVerified = true
    }else if(emailVerified === "false"){
        emailVerified = false
    }

    const valid = userValidations(undefined, email, userName, password, role, emailVerified)
    
    if(valid != true){
        res.json(valid)
        return
    }

    // check if use exist
    try{
        const existsUser = await readRow('user', {where:{email}})
        if(existsUser){
            return {errorMsg: ['An account with that email address already exists'], messageTitle: 'Notice', messageType: 'warning'}
        }
    }catch(err){
        // Error: NotFoundError: No User found
        // this is good. continue script...
    }

    try{
        // hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        
        // create new user
        const tmpUser = {
          email,
          emailVerified, 
          password: key.toString('hex'),
          salt: salt.toString('hex'),
          userName
        }

        if(role != undefined){
            tmpUser.role = {
                connect: {id: role}
              }
        }
    
        const user = await createRow('user', tmpUser)

        const msg = 'Your account has been successfully created.'
        if(emailVerified){
            msg += ' An email with a verification code was just sent to: ' + result.user.email
        }

        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    
    }catch(errorMsg){
        res.json({errorMsg: errorMsg.message, messageTitle: 'Error', messageType: 'error'})
    }

    // try{
    //     //  create new user
    //     const result = await createUser(email, username, password, role, emailverified)

    //     if(result.user){// success
    //         const msg = 'Your account has been successfully created.'
    //         if(emailverified){
    //             msg += ' An email with a verification code was just sent to: ' + result.user.email
    //         }
    //         res.locals.messages = [msg]
    //         res.locals.messageTitle = 'Success'
    //         res.locals.messageType = 'success'
    //         res.locals.hasMessages = true
    //     }else{
    //         res.locals.messages = result.errorMsg
    //         res.locals.messageTitle = result.messageTitle
    //         res.locals.messageType = result.messageType
    //         res.locals.hasMessages = true
    //     }

    // }catch(errorMsg){
    //     res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    // }
}

export async function api_editUser(req, res){
    let {id, email, userName, password, role, emailVerified} = req.body

    // Convert emailverified to boolean
    if(emailVerified === "true"){
        emailVerified = true
    }else if(emailVerified === "false"){
        emailVerified = false
    }

    const valid = userValidations(id, email, userName, password, role, emailVerified)
    
    if(valid != true){
        res.json(valid)
        return
    }

    try{
        // Validate role exists
        const selectedRole = await findUnique('role', {id: role})

        // Validate user exists
        const selectedUser = await findUnique('user', {id})

        const tmpUser = {
            email,
            emailVerified,
            userName,
            role: {
                connect: {id: selectedRole.id}
            }
        }

        if(password != ''){
            // hash passowrd
            const salt = crypto.randomBytes(16)
            const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

            tmpUser.password = key.toString('hex')
            tmpUser.salt = salt.toString('hex')
        }

        const UpdatedUser = await updateRow('user', {id: selectedUser.id}, tmpUser)

        res.json({messageBody: `User ${userName} was successfuly updated`, messageTitle: 'User Updated', messageType: 'success'})
    }catch(errorMsg){
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}