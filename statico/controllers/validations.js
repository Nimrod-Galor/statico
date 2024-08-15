import { body } from 'express-validator'
import { findUnique, readRow, readRows, updateRow, createRow, deleteRow, deleteRows, countRows } from '../../db.js'

/*  Global  */

const deleteValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('header')
        .isAlphanumeric()
]

const bulkValidation = () => [
    body('id.*')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('header.*')
        .isAlphanumeric().withMessage('Header must be Alphanumeric')
]

const postIdValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId')
]

/*  User    */
const userValidation = () => [
    body('id')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('email')
        .if((value, { req }) => !req.body.id)  // Only validate if id is empty
        .isEmail().withMessage('Enter a valid email address')
        // .normalizeEmail()
        .custom(async value => {
            // Check if user exists
            const existingUser = await findUnique('user', { email: value })
            if(existingUser){
                throw new Error('An account with that email address already exists')
            }
        })
        .normalizeEmail(),
    body('emailverified')
        .optional(),
    body('password')
        .trim()
        .isStrongPassword().withMessage('Password must contain at least one number and one special character and one uppercase and lowercase letter, and at least 8 or more characters')//minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
        .escape(),
    body('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .escape(),
    body('role')
        .custom(async value => {
            // check role exists
            const roleExists = await findUnique('role', { id: value })
            if(!roleExists){
                throw new Error('Role not exists')
            }
        })    
]



/*  Post    */
const postValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('title')
        .trim()
        .isLength({ min: 3, max: 128 }).withMessage('Title must be at least 3 characters and max 128.')
        .escape(),
    body('body')
        .notEmpty().withMessage('Body can not be empty.')
        .escape(),
    body('publish')
        .optional(),
    body('slug')
        .isSlug().withMessage('Invalid Slug'),
    body('metatitle')
        .optional({ checkFalsy: true }),
    body('metadescription')
        .optional({ checkFalsy: true })
]

/*  Comments    */
const commentValidation = () => [
    body('id')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Comment ID must be a valid MongoDB ObjectId'),
    body('post')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Post ID must be a valid MongoDB ObjectId'),
    body('parent')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Parent ID must be a valid MongoDB ObjectId'),
    body('comment')
        .notEmpty()
        .escape(),
    body('publish')
        .optional()
]

const commentsListValidation = () => [
    body('post')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('page')
        .isNumeric().withMessage('Page must be Numeric'),
    body('order')
        .isString().withMessage('Order must be String')
]


/*  Role    */
const roleValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('name')
        .trim()
        .isLength({ min: 3 }).withMessage('Role name must be at least 3 characters.')
        .isAlphanumeric().withMessage('Role name must be Alphanumeric.'),
    body('description')
        .trim()
        .isLength({ min: 3 }).withMessage('Role description must be at least 3 characters.')
        .isAlphanumeric().withMessage('Role description must be Alphanumeric.')
]
export {deleteValidation, userValidation, bulkValidation, postValidation, commentValidation, roleValidation, commentsListValidation, postIdValidation}