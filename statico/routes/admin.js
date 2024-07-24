import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import pluralize from 'pluralize'
// import { PrismaClient } from '@prisma/client'
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
            {"key": "posts", "header": "Posts", "type": "Int"},
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
        })
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

// // Count models rows
// async function modelCount(modelName){
//     const res = await countRows(modelName)
//     return res
// }

// async function updateModelsCount(){
//     for (let i =0; i < prismaModels.length; i++) {
//         // prismaModels[i].count = await modelCount(prismaModels[i].name);
//         prismaModels[i].count = await countRows(prismaModels[i].name)
//     }
// }

// updateModelsCount()

// function getSelectFields(contentType, cb){
//     const select = prismaModels.find(i => i.name == contentType).fields.filter(cb).reduce((o, key) => ({ ...o, [key.key]: true}), {})

//     return select
// }



// console.log('models',JSON.stringify(prismaModels))
async function getRoles(){
    const roles = await readRows('role', {select:{ id: true, name: true}})
    return roles
}
const roles = await readRows('role', {select:{ id: true, name: true}})


router.get("/:contentType?/:page?", ensureLoggedIn('/login'), async (req, res) => {
    // count models rows
    const modelsName = prismaModels.map(item => item.name)
    const counts = await countsRows(modelsName)
    for(let i=0; i< counts.length; i++){
        prismaModels[i].count = counts[i]
    }

    const contentType = req.params.contentType || prismaModels[0].name
    const model = prismaModels.find((model) => model.name == contentType)
    //  create Model headers array
    //const modelHeaders = model.fields//.filter((field) => {return field.visible})
    // // get initial Data
    // const skip = req.params.page || 0
    // const take = 10
    // const where = {}
    // const select = getSelectFields(contentType, (field) => {return true})
    // const orderBy = {}
    const query = {
        "skip": req.params.page || 0,
        "take": 10,
        "where": {},
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