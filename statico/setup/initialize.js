// import fs from 'fs'

import path from 'path'
import { fileURLToPath } from 'url'
import { unlink } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { error } from 'console'
import crypto from 'crypto'
// import readRows, {createRow} from '../db.js'
const prisma = new PrismaClient()

export default async function initialize(email, emailVerified, password, userName){
    // check for defaul roles
    return await prisma.role.count()
    .then(async (roles) => {
        // console.log('roles', roles)
        if(roles > 0){
            throw new Error('Installation has already been completed', "")
        }
    }).then(async () => {
        //  create subscribe rRol
        return await prisma.role.create({
            data: {
                name: 'subscriber',
                description: 'somebody who can only manage their profile.',
                default: true
            }
        })
    })
    .then(async () => {
        //  create contributor Role
        return await prisma.role.create({
            data: {
                name: 'contributor',
                description: 'somebody who can write and manage their own posts but cannot publish them.'
            }
        })
    })
    .then(async () => {
        //  create author Role
        await prisma.role.create({
                data: {
                name: 'author',
                description: 'somebody who can publish and manage their own posts.'
            }
        })
    })
    .then(async () => {
        //  create editor Role
        return await prisma.role.create({
            data: {
                name: 'editor',
                description: 'somebody who can publish and manage posts including the posts of other users.'
            }
        })
    })
    .then(async () => {
        //  create admin Role
        return await prisma.role.create({
            data: {
                name: 'admin',
                description: 'somebody who has access to all the administration features within a single site.'
            }
        })
    })
    .then(async (adminRole) => {
        // // hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    
        // create admin user
        const adminUser = {
        email,
        emailVerified,
        password: key.toString('hex'),
        salt: salt.toString('hex'),
        userName,
        role: {
            connect: {id: adminRole.id}
            }
        }
    
        await prisma.user.create({data: adminUser})
        return
    })
    .then(async () => {
        // Create Default home page
        const homePage = {
            metaTitle:  "Statico Default Home Page",
            metaDescription:  "Statico Default Home Page",
            slug:   "home",
            title:  "Statico Default Home Page",
            body:  "Statico Default Home Page",
            publish: true
        }
        await prisma.page.create({data: homePage})
        return
    })
    .then(async () => {
        // Create Default Features page
        const featuresPage = {
            metaTitle:  "Statico Default Features Page",
            metaDescription:  "Statico Default Features Page",
            slug:   "features",
            title:  "Statico Default Features Page",
            body:  "Statico Default Features Page",
            publish: true
        }
        await prisma.page.create({data: featuresPage})
        return
    })
    .then(async () => {
        // Create Default Pricing page
        const pricingPage = {
            metaTitle:  "Statico Default Pricing Page",
            metaDescription:  "Statico Default Pricing Page",
            slug:   "pricing",
            title:  "Statico Default Pricing Page",
            body:  "Statico Default Pricing Page",
            publish: true
        }
        await prisma.page.create({data: pricingPage})
        return
    })
    .then(async () => {
        // Create Default FAQ page
        const faqPage = {
            metaTitle:  "Statico Default FAQ Page",
            metaDescription:  "Statico Default FAQ Page",
            slug:   "faq",
            title:  "Statico Default FAQ Page",
            body:  "Statico Default FAQ Page",
            publish: true
        }
        await prisma.page.create({data: faqPage})
        return
    })
    .then(async () => {
        // Create Default About page
        const aboutPage = {
            metaTitle:  "Statico Default About Page",
            metaDescription:  "Statico Default About Page",
            slug:   "about",
            title:  "Statico Default About Page",
            body:  "Statico Default About Page",
            publish: true
        }
        await prisma.page.create({data: aboutPage})
        return
    })
    .then(async () => {
        //  if we got up to heare with no errors, delete setup (index) file from public folder.
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join( __dirname, '..', '..', 'public', 'index.html')
        await unlink(filePath)

        return {message: `Successfully created roles and Admin user: "${userName}"`, success: true}
    })
    .catch((err) => {
        return err
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
}

            // console.log('Start creating roles')

            // let parr = []
            // // create subscriber role

            // // create contributor role

            // // create author role

            // // create editor role

            // // create administrator role

            // const [subscriberRole, contributorRole, authorRole, editorRole, adminRole] = await Promise.all(parr)


    //         return user
    //     }
    // })