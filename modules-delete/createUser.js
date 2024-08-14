import {readRows, readRow, createRow} from '../db.js'
import isValid from '../statico/theme/scripts/validations.js'
import crypto from 'crypto'

export default async function createUser(email, username, password, roleId, emailverified = false){
    // fields validation
    try{

        // const roles = await readRows('role', {select:{ id: true, name: true}})
        // const selectedRole = roles.find((r) => r.name.toLowerCase() ===  role.toLowerCase())
        // if(role == undefined){
        //     // no role? get default role
        //     role = await readRows('role', {
        //         select: {id: true},
        //         where: {default: true}
        //     })

        //     roleId = role.id
        // }


        let errorMsg = []

        if( !isValid(email, "Email")){
            errorMsg.push('Invalid Email address')
        }
        if(!isValid(emailverified, "Boolean")){
            errorMsg.push('Invalid Credentials')
        }
        if(!isValid(username, "username")){
            errorMsg.push('Invalid User name')
        }
        if(!isValid(password, "Password")){
            errorMsg.push('Invalid Password')
        }
        // if(selectedRole === undefined){
        //     errorMsg.push()
        // }
        if(errorMsg.length != 0){
            return {errorMsg, messageTitle: 'Invalid Credentials', messageType: 'warning'}
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
              emailverified, 
              password: key.toString('hex'),
              salt: salt.toString('hex'),
              username
            }

            if(roleId != undefined){
                tmpUser.role = {
                    connect: {id: roleId}
                  }
            }
        
            const user = await createRow('user', tmpUser)
            
            return {user}
        
        }catch(err){
            return {errorMsg: [err], messageTitle: 'Error', messageType: 'danger'}
        }
    }catch(err){
        return {errorMsg: [err], messageTitle: 'Error', messageType: 'danger'}
    }


}