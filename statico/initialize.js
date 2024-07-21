// import fs from 'fs'
// import path from 'path'
import crypto from 'crypto'
import getBy, {createRow, getAll} from '../db.js'

export default async function initialize(){
    // check for defaul roles
    const roles = await getAll('role')
    if(roles.length === 0){
        console.log('Start create role')
        // create subscriber role
        const subscriberRole = await createRow('role', {
            name: 'subscriber',
            description: 'somebody who can only manage their profile.'
        })

        // create contributor role
        const contributorRole = await createRow('role', {
            name: 'contributor',
            description: 'somebody who can write and manage their own posts but cannot publish them.'
        })

        // create author role
        const authorRole = await createRow('role', {
            name: 'author',
            description: 'somebody who can publish and manage their own posts.'
        })

        // create editor role
        const editorRole = await createRow('role', {
            name: 'editor',
            description: 'somebody who can publish and manage posts including the posts of other users.'
        })

        // create administrator role
        const adminRole = await createRow('role', {
        name: 'admin',
        description: 'somebody who has access to all the administration features within a single site.'
        })

        // // create super administrator role
        // const superAdminRole = await createRow('role', {
        //     name: 'super admin',
        //     description: 'somebody with access to the site network administration features and all other features.'
        // })


        // create super administrator user
        const superUser = {
            email : 'admin@admin.com',
            password: 'admin',
            salt: crypto.randomBytes(16),
            userName: 'administrator',
            role: {
                connect: {id: adminRole.id}
              }
        }
        
        
        crypto.pbkdf2(superUser.password, superUser.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            superUser.password = hashedPassword
        })

        superUser.salt = superUser.salt.toString('hex')

        const superAdminUser = await createRow('user', superUser)
    }
}