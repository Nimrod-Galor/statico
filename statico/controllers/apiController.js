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
        await deleteRows('comment', {authorId: id})

        // Delete all user Posts
        await deleteRows('post', {authorId: id})

        //  Delete user
        await deleteRow('user', {id})

        // Send Success json
        res.json({messageBody: `User "${header}" was successfuly deleted`, messageTitle: 'User Delete', messageType: 'success'})
    }catch(errorMsg){
        // Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

function postValidations(id, title, body, publish, slug, metatitle, metadescription){
    let errorMsg = []

    if(id != undefined){
        if(!isValid(id, "objectid")){
            errorMsg.push('Invalid Post')
        }
    }
    if( !isValid(title, "Title")){
        errorMsg.push('Invalid Title')
    }
    // if(!isValid(body, "Body")){
    //     errorMsg.push('Invalid Body')
    // }
    if(!isValid(publish, "Boolean")){
        errorMsg.push('Invalid Credentials')
    }
    if(slug != '' && !isValid(slug, "Slug")){
        errorMsg.push('Invalid Slug')
    }
    if(metatitle != '' && !isValid(metatitle, "metatitle")){
        errorMsg.push('Invalid Meta Title')
    }
    if(metadescription != '' && !isValid(metadescription, "metadescription")){
        errorMsg.push('Invalid Meta Description')
    }

    if(errorMsg.length != 0){
        throw new Error(errorMsg.join("</li><li>"))
    }

    return true
}

/*  Create Page */
export async function api_createPage(req, res){
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = req.body

    // Convert publish string to boolean
    publish = stringToBoolean(publish)

    try{
        //  Validate user data
        postValidations(undefined ,title, body, publish, slug, metatitle, metadescription)

        // Set new Post object
        const tmpPage = {
            title,
            body,
            publish,
            metatitle,
            metadescription
        }

        if(slug != ''){
            // check if slug exist
            const pageWithSlug = await findUnique('page', {slug})
            if(pageWithSlug){
                // page with same slug exist
                // throw new Error('page with the same slug already been taken.')
                //  Send Error json
                res.json({messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'})
                return
            }
            // update page object
            tmpPage.slug = slug
        }

        // Create Page
        await createRow('page', tmpPage)

        // Send Success json
        res.json({messageBody: `Page "${title}" was created successfuly`, messageTitle: 'Page Created', messageType: 'success'})
    }catch(errorMsg){
        //  Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

/*  Edit Page */
export async function api_editPage(req, res){
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = req.body

    // Convert publish string to boolean
    publish = stringToBoolean(publish)

    try{
        //  Validate user data
        postValidations(id, title, body, publish, slug, metatitle, metadescription)

        // Validate user Post
        const selectedPage = await findUnique('page', {id})
        if(!selectedPage){
            throw new Error('Invalid Page')
        }

        // Set new Post object
        const tmpPost = {
            title,
            body,
            publish,
            metatitle,
            metadescription
        }


        if(slug != '' && slug != selectedPage.slug){
            // check if slug exist
            const pageWithSlug = await findUnique('page', {slug})
            if(pageWithSlug){
                // page with same slug exist
                // throw new Error('page with the same slug already been taken.')
                //  Send Error json
                res.json({messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'})
                return
            }
            // update page object
            tmpPage.slug = slug
        }

        
        // Update Page
        await updateRow('page', {id: selectedPage.id}, tmpPage)

        // Send Success json
        res.json({messageBody: `Page "${title}" was updated successfuly`, messageTitle: 'Page Updated', messageType: 'success'})
    }catch(errorMsg){
        //  Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

/*  Delete Page */
export async function api_deletePage(req, res){
     //  Get user data
     let {id, header} = req.body

     try{
         //  Validate user data
         if(!isValid(id, "objectid")){
              throw new Error('Invalid User')
         }
 
         //  Delete Page
         await deleteRow('page', {id})
 
         // Send Success json
         res.json({messageBody: `Page "${header}" was successfuly deleted`, messageTitle: 'Page Delete', messageType: 'success'})
     }catch(errorMsg){
         // Send Error json
         res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
     }
}

/*  Create Post */
export async function api_createPost(req, res){
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = req.body

    // Convert publish string to boolean
    publish = stringToBoolean(publish)

    try{
        //  Validate user data
        postValidations(undefined ,title, body, publish, slug, metatitle, metadescription)

        if(slug != ''){
            // check if slug exist
            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                // throw new Error('post with the same slug already been taken.')
                //  Send Error json
                res.json({messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'})
                return
            }
        }

        // Set new Post object
        const tmpPost = {
            title,
            body,
            publish,
            slug,
            author: {
                connect: {id: req.user.id}
            },
            metatitle,
            metadescription
        }

        // Create Post
        await createRow('post', tmpPost)

        // Send Success json
        res.json({messageBody: `Post "${title}" was created successfuly`, messageTitle: 'Post Created', messageType: 'success'})
    }catch(errorMsg){
        //  Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

/*  Edit Post */
export async function api_editPost(req, res){
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = req.body

    // Convert publish string to boolean
    publish = stringToBoolean(publish)

    try{
        //  Validate user data
        postValidations(id, title, body, publish, slug, metatitle, metadescription)

        // Validate user Post
        const selectedPost = await findUnique('post', {id})
        if(!selectedPost){
            throw new Error('Invalid Post')
        }

        // Set new Post object
        const tmpPost = {
            title,
            body,
            publish,
            metatitle,
            metadescription
        }


        if(slug != '' && slug != selectedPost.slug){
            // check if slug exist
            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                // throw new Error('post with the same slug already been taken.')
                //  Send Error json
                res.json({messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'})
                return
            }
            // update post object
            tmpPost.slug = slug
        }

        
        // Update Post
        await updateRow('post', {id: selectedPost.id}, tmpPost)

        // Send Success json
        res.json({messageBody: `Post "${title}" was updated successfuly`, messageTitle: 'Post Created', messageType: 'success'})
    }catch(errorMsg){
        //  Send Error json
        res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
    }
}

/*  Delete Post */
export async function api_deletePost(req, res){
     //  Get user data
     let {id, header} = req.body

     try{
         //  Validate user data
         if(!isValid(id, "objectid")){
              throw new Error('Invalid User')
         }
 
         // Delete all Post Comments
         await deleteRows('comment', {postId: id})
 
         //  Delete Post
         await deleteRow('post', {id})
 
         // Send Success json
         res.json({messageBody: `Post "${header}" was successfuly deleted`, messageTitle: 'Post Delete', messageType: 'success'})
     }catch(errorMsg){
         // Send Error json
         res.json({messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'})
     }
}