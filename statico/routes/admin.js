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
            const hideField = line.includes('//@hide');

            if (name.includes('@@')) {
                return null
            }
            return { name, type, isUnique, isObjectId, hideField }
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


// console.log('models',JSON.stringify(prismaModels))

router.get("/:contentType?", ensureLoggedIn('/login'), async (req, res) => {
    const contentType = req.params.contentType || prismaModels[0].name
    // get initial Data
    const select = prismaModels.find(i => i.name == contentType).fields.filter((field) => {
        return !field.hideField
    }).reduce((o, key) => ({ ...o, [key.name]: true}), {})
    const modelData = await getPagination(contentType, 0, 10, select)
    res.render('dashboard', {prismaModels, contentType, modelData})
})

export default router