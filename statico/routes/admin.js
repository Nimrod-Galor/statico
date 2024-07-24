import express from 'express'
import createError from 'http-errors'
import ensureLogIn from 'connect-ensure-login'
import bodyParser from 'body-parser'
import createUser from '../../modules/createUser.js'
import isValid from '../../modules/validations.js'

// import { PrismaClient } from '@prisma/client'
// import pluralize from 'pluralize'
import readRows, {countsRows} from '../../db.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const router = express.Router()


const prismaModels = [
    {
        "name": "User",
        "header": "Users",
        "description": "",
        "fields": [
            {"key": "userName", "header": "User Name", "type": "String"},
            {"key": "createdAt", "header": "Create Date", "type": "DateTime"},
            {"key": "email", "header": "Email", "type": "String"},
            {"key": "emailVerified", "header": "Verified", "type": "Boolean"},
            {"key": "posts", "header": "Posts", "type": "Int", "relation": "post", "filter": "author"},
            {"key": "role", "header": "Role", "type": "String"}
        ],
        "select" : {
            id: true,
            userName: true,
            createdAt: true,
            email: true,
            emailVerified: true,
            _count: {
                select: { posts: true }
            },
            role: {
                select: {
                    name: true
                }
            }
        },
        "destructur": (user) => ({
            ...user,
            posts: user._count.posts,
            role: user.role.name,
            _count: undefined // optionally remove the original _count field
        }),
        "filters": [
            {"name": "username", "key": "userName", "type": "userName"}, // by user name 
            {"name": "verified", "key": "emailVerified", "type": "Boolean"} // filter users by emailVerified
        ]
    },
      
    {
        "name": "Post",
        "header": "Posts",
        "description": "",
        "fields": [
            {"key": "createdAt", "header": "Create Date", "type": "DateTime"},
            {"key": "updatedAt", "header": "Update Date", "type": "DateTime"},
            {"key": "title", "header": "Title", "type": "String"},
            // {"key": "body", "header": "", "type": "", "visible": },
            {"key": "published", "header": "Published", "type": "Boolean"},
            {"key": "viewCount", "header": "Views", "type": "Int"},
            {"key": "author", "header": "Author", "type": "String"},
            {"key": "comments", "header": "Comments", "type": "Int"}
        ],
        "select": {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            published: true,
            viewCount: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            // comments: true
            _count:{
                select: {
                    comments: true
                }
            }

        },
        "destructur": (post) => ({
            ...post,
            author: post.author.name,
            comments: post._count.comments,
            _count: undefined
        }),
        "filters": [
            {"name": "author", "key": "authorId", "type": "ObjectID"} // filter posts by author
        ]
    },
      
    {
        "name": "Comment",
        "header": "Comments",
        "description": "",
        "fields": [
            {"key": "createdAt", "header": "Create Date", "type": "DateTime"},
            {"key": "comment", "header": "Comment", "type": "String"},
            {"key": "published", "header": "Published", "type": "Boolean"}
        ],
        "select": {
            id: true,
            createdAt: true,
            comment: true,
            published: true,
            post: {
                select:{
                    id: true
                }
            },
            postId: true
        }
    },
      
    {
        "name": "Role",
        "header": "Roles",
        "description": "",
        "fields": [
            {"key": "name", "header": "Name", "type": "String"},
            {"key": "description", "header": "Description", "type": "String"}
        ],
        "select": {
            id: true,
            name: true,
            description: true
        }
    }
]

const roles = await readRows('role', {select:{ id: true, name: true}})

// get name of all models
const modelsName = prismaModels.map(item => item.name)
// count models rows
const counts = await countsRows(modelsName)
// update counts in models list
for(let i=0; i< counts.length; i++){
    prismaModels[i].count = counts[i]
}

// Create new user
router.post("/create/user", ensureLoggedIn('/login'), urlencodedParser, async (req, res) => {
    let {email, password, username, emailverified, role} = req.body

    // sanitize ** todo

    try{
        //  create new user
        const result = await createUser(email, username, password, emailverified, role)

        if(result.user){// success
            res.locals.messages = ['Your account has been successfully created. An email with a verification code was just sent to: ' + result.user.email]
            res.locals.messgaeTitle = 'Success'
            res.locals.messageType = 'success'
        }else{
            res.locals.messages = result.errorMsg
            res.locals.messageTitle = result.messageTitle
            res.locals.messageType = result.messageType
            res.locals.hasMessages = true
        }
        res.render('/admin')
    }catch(err){
        console.error(err)
        return next(err)
    }
})

router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), async (req, res, next) => {
    ///:contentType?/*
    // get selected content type name
    const contentType = req.params.contentType || prismaModels[0].name.toLowerCase()
    // check we didnt get here by mistake
    if(!modelsName.includes(capitalizeFirstLetter(contentType))){
        try{
            const err = createError(404, 'Resource not found');
            throw err;
        } catch (err) {
            next(err); // Pass the error to the Express error handler
        }
        return
    }
    // get selected model
    const model = prismaModels.find((model) => model.name.toLowerCase() == contentType.toLowerCase())
    // check for extra parmas
    const where = {}
    // const orderBy = {}
    if(req.params[0]){
        const paramsArr = req.params[0].split('/')
        for(let i=0; i<paramsArr.length;i++){
            const param = paramsArr[i]
            // check if param of type filter 
            if(model.filters){
                // check every filter in filters list
                for(let fi=0; fi<model.filters.length; fi++){
                    let filter = model.filters[fi]
                    if(param == filter.name){
                        // we found a filter match
                        let filterOn = paramsArr[++i]
                        // check if filteron is valid
                        if(isValid(filterOn, filter.type)){
                            // set filter
                            where[filter.key] = filterOn
                        }
                        continue;
                    }
                }
            }
        }
    }



    

    //  create Model headers array
    //const modelHeaders = model.fields//.filter((field) => {return field.visible})
    // // get initial Data
    // const skip = req.params.page || 0
    // const take = 10
    // const where = req.query.filter ? createFilter(req.query.filter) : {}
    // const select = getSelectFields(contentType, (field) => {return true})
    // 
    const query = {
        "skip": req.query.page ? (req.query.page - 1) * 10 : 0,
        "take": 10,
        where,
        "select": model.select,
        "orderBy": {}
    }
    let modelData = await readRows(contentType, query)
    if(model.destructur){
        modelData = modelData.map(model.destructur)
    }

    res.render('dashboard', {user: req.user, prismaModels, contentType, modelData, modelHeaders: model.fields, roles })
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default router