import {findUnique, updateRow, createRow, deleteRow, deleteRows} from '../../db.js'
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
    if(!isValid(username, "username")){
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
        throw new Error(errorMsg.join("</li><li>"))
        // res.json({errorMsg, messageTitle: 'Invalid Credentials', messageType: 'warning'})
        // return
    }

    return true
}

function stringToBoolean(str){
    if(str === "true"){
        return true
    }else if(str === "false"){
        return false
    }
    return undefined
}

/** Create User */
export async function api_createUser(req, res){
    //  Get user data
    let {email, username, password, role, emailverified} = req.body

    // Convert emailverified string to boolean
    emailverified = stringToBoolean(emailverified)

    try{
        //  Validate user data
        userValidations(undefined, email, username, password, role, emailverified)

        // Check if user exists
        const existsUser = await findUnique('user', {email})
        if(existsUser){
            throw new Error('An account with that email address already exists')
        }

        // Hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        
        //  Set new user object
        const tmpUser = {
          email,
          emailVerified: emailverified, 
          password: key.toString('hex'),
          salt: salt.toString('hex'),
          userName: username
        }

        //  Set new user role
        if(role != undefined){
            tmpUser.role = {
                connect: {id: role}
              }
        }

        // Create new user
        await createRow('user', tmpUser)

        // Set return message
        let msg = 'Your account has been successfully created.'
        if(emailverified){
            msg += ' An email with a verification code was just sent to: ' + email
        }

        // Send Success json
        res.json({messageBody: msg, messageTitle: 'Success', messageType: 'success'})
    }catch(errorMsg){
        //  Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

export async function api_editUser(req, res){
    //  Get user data
    let {id, email, username, password, role, emailverified} = req.body

    // Convert emailverified string to boolean
    emailverified = stringToBoolean(emailverified)

    try{
        //  Validate user data
        userValidations(id, email, username, password, role, emailverified)

        // Validate role exists
        const selectedRole = await findUnique('role', {id: role})
        if(!selectedRole){
            throw new Error('Invalid Role')
        }

        // Validate user exists
        const selectedUser = await findUnique('user', {id})
        if(!selectedUser){
            throw new Error('Invalid User')
        }

        //  Set user object
        const tmpUser = {
            email,
            emailVerified: emailverified,
            userName: username,
            role: {
                connect: {id: selectedRole.id}
            }
        }

        if(password != ''){
            // Hash passowrd
            const salt = crypto.randomBytes(16)
            const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

            tmpUser.password = key.toString('hex')
            tmpUser.salt = salt.toString('hex')
        }

        //  Update user
        await updateRow('user', {id: selectedUser.id}, tmpUser)

        // Send Success json
        res.json({messageBody: `User ${username} was successfuly updated`, messageTitle: 'User Updated', messageType: 'success'})
    }catch(errorMsg){
        // Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

export async function api_deleteUser(req, res){
    //  Get user data
    let {id, header} = req.body

    try{
        //  Validate user data
        if(!isValid(id, "objectid")){
             throw new Error('Invalid User')
        }

        // Delete all user Comments
        await deleteRows('comments', {authorId: id})

        // Delete all user Posts
        await deleteRows('post', {authorId: id})

        //  Delete user
        await deleteRow('user', {id})

        // Send Success json
        res.json({messageBody: `User /"${header}/" was successfuly deleted`, messageTitle: 'User Delete', messageType: 'success'})
    }catch(errorMsg){
        // Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}