import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import pluralize from 'pluralize'
import { PrismaClient } from '@prisma/client'
import getBy, {getPagination} from '../../db.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()
const prisma = new PrismaClient();


// Basic parsing of model definitions
function parseModels(schema){
    // this code is from: https://stackoverflow.com/questions/71658510/how-can-i-get-the-all-fields-from-prisma-class
    // Thanks to James Tan https://stackoverflow.com/users/2857193/james-tan
    const modelRegex = /model (\w+) {([\s\S]*?)^}/gm
    let match
    const models = []

    while ((match = modelRegex.exec(schema)) !== null) {
        const modelName = match[1]
        const modelBody = match[2]

        const fields = modelBody.trim().split('\n')
        .filter(line => line && !line.startsWith('@') && !line.startsWith('@@'))
        .map((line) => {
            const [name, type] = line.trim().split(/\s+/)
            const isUnique = line.includes('@unique')
            const isObjectId = line.includes('@db.ObjectId');
            const ignoreField = line.includes('//@ignore');
            const hideField = line.includes('//@hide');
            const countField = line.includes('//@count');
            const relationField = line.includes('//@relation') ? line.match(/\b(\w+)$/)[0] : false;

            if (name.includes('@@')) {
                return null
            }
            return { name, type, isUnique, isObjectId, ignoreField, hideField, countField, relationField }
        }).filter(field => field !== null)

        // Extract table mapping
        const tableMappingMatch = modelBody.match(/@@map\(["'](.+?)["']\)/)
        const tableName = tableMappingMatch ? tableMappingMatch[1] : undefined

        // Extract unique constraints
        const uniqueConstraints = []
        const uniqueRegex = /@@unique\(\[([^\]]+)\]\)/g
        let uniqueMatch
        while ((uniqueMatch = uniqueRegex.exec(modelBody)) !== null) {
        const fields = uniqueMatch[1].split(',').map(field => field.trim())
        uniqueConstraints.push({ fields })
        }

        // Extract indexes
        const indexes = []
        const indexRegex = /@@index\(\[([^\]]+)\]\)/g
        let indexMatch
        while ((indexMatch = indexRegex.exec(modelBody)) !== null) {
        const fields = indexMatch[1].split(',').map(field => field.trim())
        indexes.push({ fields })
        }

        models.push({ name: modelName, plural: pluralize(modelName), tableName, fields, uniqueConstraints, indexes })
    }

    return models
}

const prismaModels = parseModels(prisma._engineConfig.inlineSchema)


// Count models rows
async function modelCount(modelName){
    const res = await prisma[modelName].count()
    return res
}

async function updateModelsCount(){
    for (const model of prismaModels) {
        model.count = await modelCount(model.name);
    }
}

updateModelsCount()

function getSelectFields(contentType, cb){
    const select = prismaModels.find(i => i.name == contentType).fields.filter(cb).reduce((o, key) => ({ ...o, [key.name]: true}), {})

    return select
}


// console.log('models',JSON.stringify(prismaModels))

router.get("/:contentType?", ensureLoggedIn('/login'), async (req, res) => {
    const contentType = req.params.contentType || prismaModels[0].name
    // get initial Data
    const select = getSelectFields(contentType, (field) => {return !field.ignoreField})
    const headers = Object.keys(getSelectFields(contentType, (field) => {return !field.ignoreField && !field.hideField}))
    const modelData = await getPagination(contentType, 0, 10, select)
    res.render('dashboard', {prismaModels, contentType, modelData, headers })
})

export default router