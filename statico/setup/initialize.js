import path from 'path'
import { fileURLToPath } from 'url'
import fs, { unlink } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
// import { error } from 'console'
import crypto from 'crypto'

const prisma = new PrismaClient()

export default async function initialize(email, emailVerified, password, userName){
    const progress = []
    // check for defaul roles
    return await prisma.role.count()
    .then(async (roles) => {
        // console.log('roles', roles)
        if(roles > 0){
            throw new Error('Installation has already been completed', "")
        }
    }).then(async () => {// ****  Create Roles
        // Update Progress
        progress.push('Subscriber Role Created.', 'Contributer Role Created.', 'Author Role Created.', 'Editor Role Created.', 'Admin Role Created.')

        // Role defenition
        const roles = [
            {
                name: 'subscriber',
                description: 'Somebody who can only manage their profile.',
                default: true
            },
            {
                name: 'contributor',
                description: 'Somebody who can write and manage their own posts but cannot publish them.'
            },
            {
                name: 'author',
                description: 'Somebody who can publish and manage their own posts.'
            },
            {
                name: 'editor',
                description: 'Somebody who can publish and manage posts including the posts of other users.'
            },
            {
                name: 'admin',
                description: 'Somebody who has access to all the administration features within a single site.'
            }
        ]

        // create roles
        const rolesPromise = []
        for(let i=0; i<roles.length; i++){
            rolesPromise.push(prisma.role.create({ data: roles[i]} ) )
        }

        const rolesCreated = await Promise.all(rolesPromise)

        return rolesCreated
    })
    .then(async (rolesCreated) => {// ****  Update permissions
        // Update Progress
        progress.push('Updated permissions.')

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const defaultfilePath = path.join( __dirname, '..', 'admin', 'permissions', 'default.permissions.json')
        // read permissions file
        let permissionsString = await fs.readFile(defaultfilePath, { encoding: 'utf8' });
        //  for each role replase role name with role id
        for(let i = 0; i < rolesCreated.length; i++){
            const regex = new RegExp(rolesCreated[i].name, "g")
            permissionsString = permissionsString.replace(regex, rolesCreated[i].id)
        }
        // create new file with updated permissions
        const filePath = path.join( __dirname, '..', 'admin', 'permissions', 'permissions.json')
        
        await fs.writeFile(filePath, permissionsString)
        
        const adminRole = rolesCreated[4]
        // return admin role to create admin user
        return adminRole
    })
    .then(async (adminRole) => {// ****  Create Admin user
        // Update Progress
        progress.push(`Admin user (${userName}) Created.`)

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
        // return
    })
    .then(async () => {// ****  Create Default Pages
        // Update Progress
        progress.push('Default Home page Created.')
        
        // Create Default home page
        const homePage = {
            metatitle:  "Statico Default Home Page",
            metadescription:  "Statico Default Home Page",
            slug:   "home",
            title:  "Statico Default Home Page",
            body:  "Statico Default Home Page",
            publish: true
        }
        await prisma.page.create({data: homePage})
        // return
    })
    .then(async () => {// ****  Create Default Features page
        // Update Progress
        progress.push('Default Features page Created.')
        
        const featuresPage = {
            metatitle:  "Statico Default Features Page",
            metadescription:  "Statico Default Features Page",
            slug:   "features",
            title:  "Statico Default Features Page",
            body:  "Statico Default Features Page",
            publish: true
        }
        await prisma.page.create({data: featuresPage})
        // return
    })
    .then(async () => {// ****  Create Default Pricing page
        // Update Progress
        progress.push('Default Home pricing Created.')
        
        const pricingPage = {
            metatitle:  "Statico Default Pricing Page",
            metadescription:  "Statico Default Pricing Page",
            slug:   "pricing",
            title:  "Statico Default Pricing Page",
            body:  "Statico Default Pricing Page",
            publish: true
        }
        await prisma.page.create({data: pricingPage})
        // return
    })
    .then(async () => {// ****  Create Default FAQ page
        // Update Progress
        progress.push('Default FAQ page Created.')
        
        const faqPage = {
            metatitle:  "Statico Default FAQ Page",
            metadescription:  "Statico Default FAQ Page",
            slug:   "faq",
            title:  "Statico Default FAQ Page",
            body:  "Statico Default FAQ Page",
            publish: true
        }
        await prisma.page.create({data: faqPage})
        // return
    })
    .then(async () => {// ****  Create Default About page
        // Update Progress
        progress.push('Default About page Created.')
        
        const aboutPage = {
            metatitle:  "Statico Default About Page",
            metadescription:  "Statico Default About Page",
            slug:   "about",
            title:  "Statico Default About Page",
            body:  "Statico Default About Page",
            publish: true
        }
        await prisma.page.create({data: aboutPage})
        // return
    })
    .then(async () => {
        // Update Progress
        progress.push('Setup completed successfully.')
        
        //  if we got up to heare with no errors, delete setup (index) file from public folder.
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join( __dirname, '..', '..', 'public', 'index.html')
        await unlink(filePath)

        return {message: progress, success: true}
    })
    .catch((err) => {
        return err
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
}






    // }).then(async () => {
    //     //  create subscribe Role
    //     return await prisma.role.create({
    //         data: {
    //             name: 'subscriber',
    //             description: 'somebody who can only manage their profile.',
    //             default: true
    //         }
    //     })
    // })
    // .then(async () => {
    //     progress.push('Subscribe Role Created.')
    //     //  create contributor Role
    //     return await prisma.role.create({
    //         data: {
    //             name: 'contributor',
    //             description: 'somebody who can write and manage their own posts but cannot publish them.'
    //         }
    //     })
    // })
    // .then(async () => {
    //     progress.push('Contributer Role Created.')
    //     //  create author Role
    //     await prisma.role.create({
    //             data: {
    //             name: 'author',
    //             description: 'somebody who can publish and manage their own posts.'
    //         }
    //     })
    // })
    // .then(async () => {
    //     progress.push('Author Role Created.')
    //     //  create editor Role
    //     return await prisma.role.create({
    //         data: {
    //             name: 'editor',
    //             description: 'somebody who can publish and manage posts including the posts of other users.'
    //         }
    //     })
    // })
    // .then(async () => {
    //     progress.push('Editor Role Created.')
    //     //  create admin Role
    //     return await prisma.role.create({
    //         data: {
    //             name: 'admin',
    //             description: 'somebody who has access to all the administration features within a single site.'
    //         }
    //     })
    // })
    