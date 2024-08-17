import createError from 'http-errors'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult, matchedData } from 'express-validator'
import { findUnique, readRow, readRows, updateRow, createRow, deleteRow, deleteRows, countRows } from '../../db.js'
import { isAuthorized } from '../permissions/permissions.js'
import modelsInterface from '../interface/modelsInterface.js'

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
                return next(createError(404, 'Resource not found'))
            }
        
            // build models data query string
            const where = req.where || {}
            const orderBy = {}
            if(req.params[0]){
                // check for extra parmas
                const paramsArr = req.params[0].split('/')
                for(let i=0; i<paramsArr.length;i++){
                    const param = paramsArr[i]
                    // check if param of type sort
                    if(param === 'desc' || param === 'asc'){
                        // let filterOn = paramsArr[++i]
                        let filterOn = paramsArr[++i]
                        
                        // check if field is relation table
                        if(!selectedModel.selectFields[filterOn]){// count
                            orderBy[filterOn] = {
                                "_count" : param
                            }
                        }else if(typeof selectedModel.selectFields[filterOn] === 'object'){// relation
                            const field = selectedModel.displayFields.find(field => field.key === filterOn)
                            orderBy[field.sortRelation]= {
                                [field.sortKey] : param
                            }
                        }else{
                            switch(filterOn){// some fields are computed by prisma. see db.js
                                case 'createDate':
                                    filterOn = 'createdAt'
                                break
                                case 'updated':
                                    filterOn = 'updatedAt'
                                break
                            }
                            orderBy[filterOn] = param
                        }

                        continue
                    }

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
                orderBy
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


/****************************************/
/** User                                */
/****************************************/

/** Create User */
export async function createUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // dont send varification Email
        req.sendVerificationMail = false
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {email, username, password, role, emailverified} = matchedData(req, { includeOptionals: true });

    // sendVerificationMail will determine if send verification 
    req.sendVerificationMail = emailverified ? true : false
    // in admin form user select "Send verification email". if selected emailverifed is false
    emailverified = emailverified ? false : true

    try{
        if(role == undefined){
            // no role selected, get default role
            const defaultRole = await readRow('role', {
                select: {id: true},
                where: {default: true}
            })
            
            role = defaultRole.id
        }

        // Hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

        // Create a verification token
        // we need this variable down in the sendmail middleware.
        req.verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token and expiration date
        const verificationTokenExpires = new Date(Date.now() + 3600000) // 1 hour
        
        //  Set new user object
        const tmpUser = {
          email,
          emailVerified: emailverified, 
          password: key.toString('hex'),
          salt: salt.toString('hex'),
          userName: username,
          role: {
            connect: {id: role}
          },
          verificationToken: req.verificationToken,
          verificationTokenExpires
        }

        // Create new user
        await createRow('user', tmpUser)

        // Set return message
        let msg = 'Your account has been successfully created.'
        if(!emailverified){
            msg += ' An email with a verification code was just sent to: ' + email
        }

        // Send Success json
        req.crud_response = {messageBody: msg, messageTitle: 'Success', messageType: 'success'}
    }catch(errorMsg){
        // dont send varification Email
        req.sendVerificationMail = false
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

export async function editUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let {id, email, username, password, role, emailverified} = matchedData(req, { includeOptionals: true });

    // Convert emailverified checkbox to boolean
    emailverified = emailverified ? true : false

    try{
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

export async function deleteUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let {id, header} = matchedData(req, { includeOptionals: true });

    try{
        //  Validate user data
        // validateDeleteData(id, header)

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

/*  Create Page */
export async function createPage(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = matchedData(req, { includeOptionals: true });
    
    // Convert publish checkbox to boolean
    publish = publish ? true : false
    
    try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = matchedData(req, { includeOptionals: true });

    // Convert publish checkbox to boolean
    publish = publish ? true : false

    try{
        // Validate user Post
        const selectedPage = await findUnique('page', {id})
        if(!selectedPage){
            throw new Error('Invalid Page')
        }

        // Set new Page object
        const tmpPage = {
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {id, header} = matchedData(req, { includeOptionals: true });

    try{
        await deleteRow('page', {id})

        // Send Success json
        req.crud_response = {messageBody: `Page "${header}" was successfuly deleted`, messageTitle: 'Page Delete', messageType: 'success'}
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {title, body, publish, slug, metatitle, metadescription} = matchedData(req, { includeOptionals: true });

    // Convert publish checkbox to boolean
    publish = publish ? true : false

    try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {id, title, body, publish, slug, metatitle, metadescription} = matchedData(req, { includeOptionals: true });

    // Convert publish checkbox to boolean
    publish = publish ? true : false

    try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
     //  Get user data
     let {id, header} = matchedData(req, { includeOptionals: true });

     try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {post, page = 1, order} = matchedData(req, { includeOptionals: true });
    const commentsPerPage = 5
    try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {post, parent, comment } = matchedData(req, { includeOptionals: true });

    try{
        // Set new Comment object
        const tmpComment = {
            post: {
                connect: {id: post}
            },
            author: {
                connect: {id: req.user.id}
            },
            comment
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    let {id, parent, comment, publish } = matchedData(req, { includeOptionals: true });

    // Convert publish checkbox to boolean
    publish = publish ? true : false

    try{
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {id, header} = matchedData(req, { includeOptionals: true });

    try {
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {id} = matchedData(req, { includeOptionals: true });

    try {
        const messageBody = await countRows('comment', {
            postId: id,
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {id} = matchedData(req, { includeOptionals: true });

    try {
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {id} = matchedData(req, { includeOptionals: true });

    try {
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

// Edit Role
export async function editeRole(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    const {id, name, description} = matchedData(req, { includeOptionals: true });

    try {
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

// Delete
export function bulkDelete(contentType){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        let {id, header} = matchedData(req, { includeOptionals: true });
        let messageBody = ''
        try{
            //  Delete
            if(Array.isArray(id)){
                messageBody = []
                for(let i=0; i< id.length; i++){
                    await deleteRow(contentType, { id: id[i] })
                    messageBody.push(`${contentType} "${header[i]}" was successfuly deleted`)
                }
            }else{
                await deleteRow(contentType, { id })
                messageBody = `${contentType} "${header}" was successfuly deleted`
            }

            // Send Success json
            req.crud_response = { messageBody, messageTitle: `${contentType} Delete`, messageType: 'success' }
        }catch(errorMsg){
            // Send Error json
            req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
        }
        finally{
            next()
        }
    }
}

// Update publish
export function bulkPublish(contentType, publish){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        let {id, header} = matchedData(req, { includeOptionals: true });
        let messageBody = ''
        try{
            let action
            let obj
            if(contentType === 'user'){
                action = req.originalUrl.includes('unpublish') ? 'Unverify' : 'Verify'
                obj = { emailVerified: publish }
            }else{
                action = req.originalUrl.includes('unpublish') ? 'Unpublish' : 'Publish'
                obj = { publish }
            }
            //  Publish
            if(Array.isArray(id)){
                messageBody = []
                for(let i=0; i< id.length; i++){
                    await updateRow(contentType, { id: id[i] }, obj)
                    messageBody.push(`${contentType} "${header[i]}" was successfuly ${action}`)
                }
            }else{
                await updateRow(contentType, { id: id }, obj)
                messageBody = `${contentType} "${header}" was successfuly ${action}`
            }

            // Send Success json
            req.crud_response = { messageBody, messageTitle: `${contentType} ${action}`, messageType: 'success' }
        }catch(errorMsg){
            // Send Error json
            req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
        }
        finally{
            next()
        }
    }
}

// Bulk Delete user
export async function bulkDeleteUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {id, header} = matchedData(req, { includeOptionals: true });
    let messageBody = ''
    try{
        //  Delete
        if(Array.isArray(id)){
            messageBody = []
            for(let i=0; i< id.length; i++){
                // Delete all user Comments
                await deleteRows('comment', { authorId: id[i] })

                // Delete all user Posts
                await deleteRows('post', { authorId: id[i] })

                //  Delete user
                await deleteRow('user', { id: id[i] })

                messageBody.push(`User "${header[i]}" was successfuly deleted`)
            }
        }else{
            // Delete all user Comments
            await deleteRows('comment', { authorId: id })

            // Delete all user Posts
            await deleteRows('post', { authorId: id })

            //  Delete user
            await deleteRow('user', { id })

            messageBody = `User "${header}" was successfuly deleted`
        }

        // Send Success json
        req.crud_response = { messageBody, messageTitle: `User Delete`, messageType: 'success' }
    }catch(errorMsg){
        // Send Error json
        req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
    }
    finally{
        next()
    }
}