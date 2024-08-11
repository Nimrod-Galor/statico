import {findUnique, readRow, readRows, updateRow, createRow, deleteRow, deleteRows, countRows} from '../../db.js'
import {isAuthorized} from '../admin/permissions/permissions.js'
import createError from 'http-errors'
import modelsInterface from '../interface/modelsInterface.js'
import isValid from '../admin/theme/scripts/validations.js'
import crypto from 'crypto'

/*  admin list content  */
export function listContent(contentType){
    return async function(req, res, next){
        try{
            // get selected content type name
            contentType = contentType || req.params.contentType || Object.keys(modelsInterface)[0]
            
            // get selected model
            const selectedModel = Object.entries(modelsInterface).find(([modelName,model]) => modelName === contentType)[1]
        
            // check we didnt get here by mistake
            if(selectedModel === undefined){
                next(createError(404, 'Resource not found'))
                return
            }
        
            // build models data query string
            const where = req.where || {}
            // const orderBy = {}
            if(req.params[0]){
                // check for extra parmas
                const paramsArr = req.params[0].split('/')
                for(let i=0; i<paramsArr.length;i++){
                    const param = paramsArr[i]
                    // check if param of type filter 
                    const filter = selectedModel.filters.find(f => f.name == param)
                    if(filter){
                        let filterOn = paramsArr[++i]
                        // check if filteron is valid
                        if(isValid(filterOn, filter.type)){
                            if(filter.type === "BooleanString"){
                                filterOn = stringToBoolean(filterOn)
                            }
                            // set filter
                            where[filter.key] = filterOn
                        }
                    }
                }
            }
        
            const query = {
                "skip": req.query.page ? (req.query.page - 1) * 10 : 0,
                "take": 10,
                where,
                "select": selectedModel.selectFields,
                "orderBy": {}
            }
            //  Get models data
            let modelsData = await readRows(contentType, query)
            
            // destruct nested fields
            if('destructur' in selectedModel){
                modelsData = modelsData.map(selectedModel.destructur)
            }

            req.contentType = contentType
            req.selectedModel = selectedModel
            req.modelsData = modelsData
            // response for api
            req.crud_response = {messageBody: modelsData, messageTitle: 'Success', messageType: 'data'}
        }catch(errorMsg){
            //  Send Error json
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
        }
        finally{
            next()
        }
    }
}

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

/****************************************/
/** User                                */
/****************************************/

/** Create User */
export async function createUser(req, res, next){
    //  Get user data
    let {email, username, password, role, emailverified = 'true'} = req.body

    // Convert emailverified string to boolean
    emailverified = stringToBoolean(emailverified)

    try{
        if(role == undefined){
            // no role selected, get default role
            const defaultRole = await readRow('role', {
                select: {id: true},
                where: {default: true}
            })
            
            role = defaultRole.id
        }
        
        // const roles = await readRows('role', {select:{ id: true, name: true}})
        // const selectedRole = roles.find((r) => r.name.toLowerCase() ===  role.toLowerCase())



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
          userName: username,
          role: {
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
        req.crud_response = {messageBody: msg, messageTitle: 'Success', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

export async function editUser(req, res, next){
    //  Get user data
    let {id, email, username, password, role, emailverified} = req.body

    // Convert emailverified string to boolean
    emailverified = stringToBoolean(emailverified)

    try{
        //  Validate user data
        userValidations(id, email, username, password, role, emailverified)

        // redundant will throw error
        // // Validate role exists
        // const selectedRole = await findUnique('role', {id: role})
        // if(!selectedRole){
        //     throw new Error('Invalid Role')
        // }

        // // Validate user exists
        // const selectedUser = await findUnique('user', {id})
        // if(!selectedUser){
        //     throw new Error('Invalid User')
        // }

        //  Set user object
        const tmpUser = {
            email,
            emailVerified: emailverified,
            userName: username,
            role: {
                connect: {id: role}
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
        await updateRow('user', {id}, tmpUser)

        // Send Success json
        req.crud_response = {messageBody: `User ${username} was successfuly updated`, messageTitle: 'User Updated', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

function validateDeleteData(id, header){
    //  Validate user data
    if(typeof(id) === "object"){
        for(let i=0; i< id.length; i++){
            if(!isValid(id[i], "objectid")){
                throw new Error('Invalid User')
            }
        }
    }else if(!isValid(id, "objectid")){
        throw new Error('Invalid User')
    }

    if(!isValid(header, "body")){
        throw new Error('Invalid Header')
    }
}

export async function deleteUser(req, res, next){
    //  Get user data
    let {id, header} = req.body

    try{
        //  Validate user data
        validateDeleteData(id, header)

        // Delete all user Comments
        await deleteRows('comment', {authorId: id})

        // Delete all user Posts
        await deleteRows('post', {authorId: id})

        //  Delete user
        await deleteRow('user', {id})

        // Send Success json
        req.crud_response = {messageBody: `User "${header}" was successfuly deleted`, messageTitle: 'User Delete', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/****************************************/
/** Page                                */
/****************************************/

// Validations for Post and Page
function postValidations(id, title, body, publish, slug, metatitle, metadescription){
    let errorMsg = []

    if(id != undefined){
        if(typeof(id) === "object"){
            for(let i=0; i< id.length; i++){
                if(!isValid(id[i], "objectid")){
                    throw new Error('Invalid User')
                }
            }
        }else if(!isValid(id, "objectid")){
            throw new Error('Invalid User')
        }
    }
    if( !isValid(title, "Title")){
        errorMsg.push('Invalid Title')
    }
    if(!isValid(body, "Body")){
        errorMsg.push('Invalid Body')
    }
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
export async function createPage(req, res, next){
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = req.body

    if(publish){
        // Convert publish string to boolean
        publish = stringToBoolean(publish)
    }else{
        // pulish was not checked. we get undefined
        publish = false
    }

    try{
        //  Validate user data
        postValidations(undefined ,title, body, publish, slug, metatitle, metadescription)

        if(slug != ''){
            // check if slug exist
            const pageWithSlug = await findUnique('page', {slug})
            if(pageWithSlug){
                // page with same slug exist
                req.crud_response = {messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }

            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                req.crud_response = {messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }
        }

        // Set new Post object
        const tmpPage = {
            title,
            body,
            publish,
            slug,
            metatitle,
            metadescription
        }

        // Create Page
        await createRow('page', tmpPage)

        // Send Success json
        req.crud_response = {messageBody: `Page "${title}" was created successfuly`, messageTitle: 'Page Created', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Edit Page */
export async function editPage(req, res, next){
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = req.body

    if(publish){
        // Convert publish string to boolean
        publish = stringToBoolean(publish)
    }else{
        // pulish was not checked. we get undefined
        publish = false
    }

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
                req.crud_response = {messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }

            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                req.crud_response = {messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }
            // update page object
            tmpPage.slug = slug
        }

        
        // Update Page
        await updateRow('page', {id: selectedPage.id}, tmpPage)

        // Send Success json
        req.crud_response = {messageBody: `Page "${title}" was updated successfuly`, messageTitle: 'Page Updated', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Delete Page */
export async function deletePage(req, res, next){
    //  Get user data
    let {id, header} = req.body
    let messageBody = ''
    try{
        //  Validate user data
        validateDeleteData(id, header)

        //  Delete Page
        if(typeof(id) === "object"){
            messageBody = []
            for(let i=0; i< id.length; i++){
                await deleteRow('page', {id: id[i]})
                messageBody.push(`Page "${header[i]}" was successfuly deleted`)
            }
        }else{
            await deleteRow('page', {id})
            messageBody = `Page "${header}" was successfuly deleted`
        }

        // Send Success json
        req.crud_response = {messageBody, messageTitle: 'Page Delete', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}


/****************************************/
/** Post                                */
/****************************************/

/*  Create Post */
export async function createPost(req, res, next){
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = req.body

    if(publish){
        // Convert publish string to boolean
        publish = stringToBoolean(publish)
    }else{
        // pulish was not checked. we get undefined
        publish = false
    }

    try{
        //  Validate user data
        postValidations(undefined ,title, body, publish, slug, metatitle, metadescription)

        if(slug != ''){
            // check if slug exist
            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                req.crud_response = {messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }

            const pageWithSlug = await findUnique('page', {slug})
            if(pageWithSlug){
                // page with same slug exist
                req.crud_response = {messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
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
        req.crud_response = {messageBody: `Post "${title}" was created successfuly`, messageTitle: 'Post Created', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Edit Post */
export async function editPost(req, res, next){
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = req.body

    if(publish){
        // Convert publish string to boolean
        publish = stringToBoolean(publish)
    }else{
        // pulish was not checked. we get undefined
        publish = false
    }

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

        // check if user have publisg permission
        if(isAuthorized('publish_post', req.user.roleId)){
            tmpPost.publish = publish
        }

        if(slug != '' && slug != selectedPost.slug){
            // check if slug exist
            const postWithSlug = await findUnique('post', {slug})
            if(postWithSlug){
                // post with same slug exist
                req.crud_response = {messageBody: 'post with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }

            const pageWithSlug = await findUnique('page', {slug})
            if(pageWithSlug){
                // page with same slug exist
                req.crud_response = {messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                return
            }
            // update post object
            tmpPost.slug = slug
        }

        // Update Post
        await updateRow('post', {id: selectedPost.id}, tmpPost)

        // Send Success json
        req.crud_response = {messageBody: `Post "${title}" was updated successfuly`, messageTitle: 'Post Updated', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Delete Post */
export async function deletePost(req, res, next){
     //  Get user data
     let {id, header} = req.body

     try{
         //  Validate user data
         validateDeleteData(id, header)
 
         // Delete all Post Comments
         await deleteRows('comment', {postId: id})
 
         //  Delete Post
         await deleteRow('post', {id})
 
         // Send Success json
         req.crud_response = {messageBody: `Post "${header}" was successfuly deleted`, messageTitle: 'Post Delete', messageType: 'success'}
     }catch(errorMsg){
         // Send Error json
         req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
     }
     finally{
        next()
    }
}

/****************************************/
/** Comments                            */
/****************************************/
function commentValidation(postid, parent, body, publish = false){
    // Validate user Data
    let errorMsg = []

    if(!isValid(postid, "objectid")){
        errorMsg.push('Invalid Post')
    }

    if(parent && parent != ''){
        if(!isValid(parent, "objectid")){
            errorMsg.push('Invalid Comment')
        }
    }

    if(!isValid(body, "body")){
        errorMsg.push('Invalid Comment')
    }
    
    if(!isValid(publish, "Boolean")){
        errorMsg.push('Invalid Credentials')
    }

    if(errorMsg.length != 0){
        throw new Error(errorMsg.join("</li><li>"))
    }
}

async function fetchAllComments(parentId, flaten, publish) {
    const query = {
        "where": {parentId},
        "select": {
            id: true,
            createdAt: true,
            comment: true,
            author: {
                select: {
                    userName: true
                }
            },
            replies: true,
            likes: true,
            dislikes: true
        }
    }

    if(publish != undefined){// allow selection of publish true, false and all
        query.where.publish = publish
    }

    // Get replies comments
    let comments = await readRows('comment', query)
    // Recursively fetch replies
    for(let i=0; i<comments.length; i++){
        if(comments[i].replies && comments[i].replies.length > 0){
            // get replies
            const nestedComments = await fetchAllComments(comments[i].id, flaten, publish);
            if(flaten){
                comments.push(...nestedComments)
            }else{
                comments[i].replies = [...nestedComments]
            }
        }
    }
    return comments
}

/*  Get comments    */
export async function listComments(req, res, next){
    const {post, page = 1, order} = req.body
    const commentsPerPage = 5
    try{
        // validate User data
        if(!isValid(post, "objectid")){
            throw new Error('Invalid Post')
        }

        if(!isValid(page, "number")){
            throw new Error('Invalid Page Number')
        }

        if(!isValid(order, "string")){
            throw new Error('Invalid Order')
        }

        const query = {
            "skip": parseInt(page - 1) * commentsPerPage,
            "take": commentsPerPage,
            "where": {postId: post, publish: true, parent: null},
            "select": {
                id: true,
                createdAt: true,
                comment: true,
                author: {
                    select: {
                        userName: true
                    }
                },
                replies: true,
                likes: true,
                dislikes: true
            },
            // "orderBy": {}
        }

        if(order){
            const commentModel = modelsInterface['comment']//.find(item => item.name == 'Comment')
            if( order in commentModel.orderBy){
                query.orderBy = commentModel.orderBy[order]
            }
        } 

        // Get comments
        let comments = await readRows('comment', query)
        // Recursively fetch replies
        for(let i=0; i<comments.length; i++){
            if(comments[i].replies && comments[i].replies.length > 0){
                // get replies
                const nestedComments = await fetchAllComments(comments[i].id, false, true);
                comments[i].replies = [...nestedComments]
            }
        }

        req.crud_response = {messageBody: comments, messageTitle: '', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Create Comment  */
export async function createComment(req, res, next){
    const {post, parent, body } = req.body

    try{
        // Validate user Data
        commentValidation(post, parent, body)

        // Set new Comment object
        const tmpComment = {
            post: {
                connect: {id: post}
            },
            author: {
                connect: {id: req.user.id}
            },
            comment: body
        }

        if(parent){
            tmpComment.parent = {
                connect: {id: parent}
            }
        }

        // Create Comment
        await createRow('comment', tmpComment)

        // Send Success json
        req.crud_response = {messageBody: 'Your comment is awaiting moderation.', messageTitle: 'Comment Created', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Edit Comment    */
export async function editComment(req, res, next){
    let {id, parent, comment, publish } = req.body

    if(publish){
        // Convert publish string to boolean
        publish = stringToBoolean(publish)
    }else{
        publish = false
    }

    try{
        // Validate user Data
        commentValidation(id, parent, comment, publish)

        const tmpComment = {
            comment,
            publish
        }

        // Delete Comment
        await updateRow('comment', {id}, tmpComment)

        // Send Success json
        req.crud_response = {messageBody: `Comment "${comment}" was successfuly updated`, messageTitle: 'Comment Delete', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}


/*  Delete Comment and replies*/
export async function deleteComment(req, res, next){
    const {id, header} = req.body

    try {
        // Validate User data
        validateDeleteData(id, header)

        // get comment to delete
        const commentsToDelete = [await findUnique('comment', {id})]
        // Fetch all comments and replies recursively
        commentsToDelete.push(... await fetchAllComments(id, true))

        // Delete comments and replies
        for (const comment of commentsToDelete.reverse()) {
            await deleteRow('comment', {id: comment.id})
        }

        req.crud_response = {messageBody: `Deleted comment "${header}" And all its replies.`, messageTitle: 'Comment Delete', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Count Comments  */
export async function countComments(req, res, next){
    const {postid} = req.body

    try {
        if(!isValid(postid, "objectid")){
            throw new Error('Invalid Post')
        }

        const messageBody = await countRows('comment', {
            postId: postid,
            publish: true,
            parent: null
        })

        req.crud_response = {messageBody, messageTitle: 'Count Comments', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  Like Comments  */
export async function likeComment(req, res, next){
    const {id} = req.body

    try {
        if(!isValid(id, "objectid")){
            throw new Error('Invalid Post')
        }

        await updateRow('comment', {id}, { likes: { increment: 1 } })

        req.crud_response = {messageBody: `Like Comment ${id}`, messageTitle: 'Count Comments', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/*  dislike Comments  */
export async function dislikeComment(req, res, next){
    const {id} = req.body

    try {
        if(!isValid(id, "objectid")){
            throw new Error('Invalid Post')
        }

        await updateRow('comment', {id}, { dislikes: { increment: 1 } })

        req.crud_response = {messageBody: `Dislike Comment ${id}`, messageTitle: 'Count Comments', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}



/****************************************/
/** Role                                */
/****************************************/

// List roles
export async function listRoles(req, res, next){
    try {
        //  Get roles
        const roles = await readRows('role', {select:{ id: true, name: true, description: true, default: true}})

        req.crud_response = {messageBody: roles, messageTitle: 'Count Comments', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

function roleValidations(id, name, description){
    // Validate user Data
    let errorMsg = []

    if(!isValid(id, "objectid")){
        errorMsg.push('Invalid Role')
    }
    if( !isValid(name, "username")){
        errorMsg.push('Invalid Name')
    }
    if(!isValid(description, "metadescription")){
        errorMsg.push('Invalid Description')
    }
    
    if(errorMsg.length != 0){
        throw new Error(errorMsg.join("</li><li>"))
    }

    return true
}
// Edit Role
export async function editeRole(req, res, next){
    const {id, name, description} = req.body

    try {
        roleValidations(id, name, description)

        await updateRow('role', {id}, { name, description })

        req.crud_response = {messageBody: `Rolet ${name} was successfuly updated`, messageTitle: 'Role updated', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}