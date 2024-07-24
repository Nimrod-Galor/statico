import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { PrismaClient } from '@prisma/client'

// import pluralize from 'pluralize'
import readRows, {countsRows} from '../../db.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
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

function checkFilterIsValid(data, type){
    switch(type){
        case "uuid":
            let regUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
        break;
        case "ObjectID":
            let regObjectID = /^[a-f\d]{24}$/i
                return regObjectID.test(data)
        break;
        case "Boolean":
            return (data.toLowerCase() === 'true' || data.toLowerCase() === 'false')
        break;
        case "userName":
            let regUserName = /^[A-Za-z][A-Za-z0-9_]{6,29}$/
            return regUserName.test(data)
        break;
    }

    return false
}

const roles = await readRows('role', {select:{ id: true, name: true}})

// get name of all models
const modelsName = prismaModels.map(item => item.name)
// count models rows
const counts = await countsRows(modelsName)
// update counts in models list
for(let i=0; i< counts.length; i++){
    prismaModels[i].count = counts[i]
}

router.get(["/:contentType?", "/:contentType?/*"], ensureLoggedIn('/login'), async (req, res) => {
    ///:contentType?/*
    // get selected content type name
    const contentType = req.params.contentType || prismaModels[0].name.toLowerCase()
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
                        if(checkFilterIsValid(filterOn, filter.type)){
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

    res.render('dashboard', {prismaModels, contentType, modelData, modelHeaders: model.fields, roles })
})



export default router