import express from 'express'
import ensureLogIn from 'connect-ensure-login'
// import pluralize from 'pluralize'
// import { PrismaClient } from '@prisma/client'
import readRows, {countRows} from '../../db.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()


const prismaModels = [
    {
        "name": "User",
        "header": "Users",
        "description": "",
        "fields": [
            {"key": "id", "header": "Id", "type": "String", "visible": false},
            {"key": "userName", "header": "User Name", "type": "String", "visible": true},
            {"key": "createdAt", "header": "Create Date", "type": "DateTime", "visible": true},
            {"key": "email", "header": "Email", "type": "String", "visible": true},
            {"key": "emailVerified", "header": "Verified", "type": "Boolean", "visible": true},
            {"key": "posts", "header": "Posts", "type": "Int", "visible": true},
            {"key": "role", "header": "Role", "type": "String", "visible": true}
        ]
    },
      
    {
        "name": "Post",
        "header": "Posts",
        "description": "",
        "fields": [
            {"key": "id", "header": "Id", "type": "String", "visible": false},
            {"key": "createdAt", "header": "Create Date", "type": "DateTime", "visible": true},
            {"key": "updatedAt", "header": "Update Date", "type": "DateTime", "visible": true},
            {"key": "title", "header": "Title", "type": "String", "visible": true},
            // {"key": "body", "header": "", "type": "", "visible": },
            {"key": "published", "header": "Published", "type": "Boolean", "visible": true},
            {"key": "viewCount", "header": "Views", "type": "Int", "visible": true},
            {"key": "author", "header": "Author", "type": "String", "visible": true},
            {"key": "authorId", "header": "authorId", "type": "String", "visible": false},
            {"key": "comments", "header": "Comments", "type": "Int", "visible": true}
        ]
    },
      
    {
        "name": "Comment",
        "header": "Comments",
        "description": "",
        "fields": [
            {"key": "id", "header": "Id", "type": "String", "visible": false},
            {"key": "createdAt", "header": "Create Date", "type": "DateTime", "visible": true},
            {"key": "comment", "header": "Comment", "type": "String", "visible": true},
            {"key": "published", "header": "Published", "type": "Boolean", "visible": true},
            {"key": "postId", "header": "postId", "type": "String", "visible": false},
        ]
    },
      
    {
        "name": "Role",
        "header": "Roles",
        "description": "",
        "fields": [
            {"key": "id", "header": "Id", "type": "String", "visible": false},
            {"key": "name", "header": "Name", "type": "String", "visible": true},
            {"key": "description", "header": "Description", "type": "String", "visible": true}
        ]
    }
]

// const prisma = new PrismaClient();
// // Basic parsing of model definitions
// function parseModels(schema){
//     // this code is from: https://stackoverflow.com/questions/71658510/how-can-i-get-the-all-fields-from-prisma-class
//     // Thanks to James Tan https://stackoverflow.com/users/2857193/james-tan
//     const modelRegex = /model (\w+) {([\s\S]*?)^}/gm
//     let match
//     const models = []

//     while ((match = modelRegex.exec(schema)) !== null) {
//         const modelName = match[1]
//         const modelBody = match[2]

//         const fields = modelBody.trim().split('\n')
//         .filter(line => line && !line.startsWith('@') && !line.startsWith('@@'))
//         .map((line) => {
//             const [name, type] = line.trim().split(/\s+/)
//             const isUnique = line.includes('@unique')
//             const isObjectId = line.includes('@db.ObjectId');
//             const ignoreField = line.includes('//@ignore');
//             const hideField = line.includes('//@hide');
//             const countField = line.includes('//@count');
//             const relationField = line.includes('//@relation') ? line.match(/\b(\w+)$/)[0] : false;

//             if (name.includes('@@')) {
//                 return null
//             }
//             return { name, type, isUnique, isObjectId, ignoreField, hideField, countField, relationField }
//         }).filter(field => field !== null)

//         // Extract table mapping
//         const tableMappingMatch = modelBody.match(/@@map\(["'](.+?)["']\)/)
//         const tableName = tableMappingMatch ? tableMappingMatch[1] : undefined

//         // Extract unique constraints
//         const uniqueConstraints = []
//         const uniqueRegex = /@@unique\(\[([^\]]+)\]\)/g
//         let uniqueMatch
//         while ((uniqueMatch = uniqueRegex.exec(modelBody)) !== null) {
//         const fields = uniqueMatch[1].split(',').map(field => field.trim())
//         uniqueConstraints.push({ fields })
//         }

//         // Extract indexes
//         const indexes = []
//         const indexRegex = /@@index\(\[([^\]]+)\]\)/g
//         let indexMatch
//         while ((indexMatch = indexRegex.exec(modelBody)) !== null) {
//         const fields = indexMatch[1].split(',').map(field => field.trim())
//         indexes.push({ fields })
//         }

//         models.push({ name: modelName, plural: pluralize(modelName), tableName, fields, uniqueConstraints, indexes })
//     }

//     return models
// }

// const prismaModels = parseModels(prisma._engineConfig.inlineSchema)


// Count models rows
async function modelCount(modelName){
    const res = await countRows(modelName)
    return res
}

async function updateModelsCount(){
    for (let i =0; i < prismaModels.length; i++) {
        prismaModels[i].count = await modelCount(prismaModels[i].name);
    }
}

updateModelsCount()

function getSelectFields(contentType, cb){
    const select = prismaModels.find(i => i.name == contentType).fields.filter(cb).reduce((o, key) => ({ ...o, [key.key]: true}), {})

    return select
}


// console.log('models',JSON.stringify(prismaModels))

router.get("/:contentType?", ensureLoggedIn('/login'), async (req, res) => {
    const contentType = req.params.contentType || prismaModels[0].name
    //  create Model headers array
    const headers = Object.keys(getSelectFields(contentType, (field) => {return field.visible}))
    // // get initial Data
    const select = getSelectFields(contentType, (field) => {return true})
    const modelData = await readRows(contentType, 0, 10, select)

    res.render('dashboard', {prismaModels, contentType, modelData, headers })
})

export default router