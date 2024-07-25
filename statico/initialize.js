// import fs from 'fs'
// import path from 'path'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
// import readRows, {createRow} from '../db.js'
const prisma = new PrismaClient()

export default async function initialize(){
    // check for defaul roles
    await prisma['role'].count()
    .then(async (roles) => {
        console.log('roles', roles)
        if(roles === 0){
            console.log('Start creating roles')

            let parr = []
            // create subscriber role
            //subscriberRole
            parr.push(prisma['role'].create({
                data: {
                name: 'subscriber',
                description: 'somebody who can only manage their profile.',
                default: true
            }}))

            // create contributor role
            // contributorRole
            parr.push(prisma['role'].create({
                data: {
                name: 'contributor',
                description: 'somebody who can write and manage their own posts but cannot publish them.'
            }}))

            // create author role
            // authorRole
            parr.push(prisma['role'].create({
                data: {
                name: 'author',
                description: 'somebody who can publish and manage their own posts.'
            }}))

            // create editor role
            //editorRole
            parr.push(prisma['role'].create({
                data: {
                name: 'editor',
                description: 'somebody who can publish and manage posts including the posts of other users.'
            }}))

            // create administrator role
            //adminRole
            parr.push(prisma['role'].create({
                data: {
                name: 'admin',
                description: 'somebody who has access to all the administration features within a single site.'
            }}))

            const [subscriberRole, contributorRole, authorRole, editorRole, adminRole] = await Promise.all(parr)

            // hash passowrd
            const salt = crypto.randomBytes(16)
            const key = crypto.pbkdf2Sync('password', salt, 100000, 64, 'sha512');

            // create new user
            const tmpUser = {
            email: 'admin@admin.com',
            emailVerified: true,
            password: key.toString('hex'),
            salt: salt.toString('hex'),
            userName: 'admin',
            role: {
                connect: {id: subscriberRole.id}
                }
            }

            const user = await prisma['user'].create({data: tmpUser})
                .catch(err => {throw new Error(err)})
            
        }
    })
    .catch(err => {throw new Error(err)})
    .finally(async () => {
        await prisma.$disconnect()
    })
}