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
        .isEmail().withMessage('Enter a valid email address')
        // .normalizeEmail()
        .custom(async value => {
            // Check if user exists
            const existingUser = await findUnique('user', { email: value })
            if(existingUser){
                throw new Error('An account with that email address already exists')
            }
        }),
    body('emailverified')
        .optional(),
    body('password')
        .trim()
        .isLength({ min: 8, max: 32 }).withMessage('Password must be at least 6 characters long')
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
        .isAlphanumeric()
        .escape(),
    body('body')
        .notEmpty()
        .escape(),
    body('publish')
        .optional(),
    body('slug')
        .isSlug(),
    body('metatitle')
        .optional({ checkFalsy: true }),
    body('metadescription')
        .optional({ checkFalsy: true })
]

/*  Comments    */
const commentValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('parent')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Parent ID must be a valid MongoDB ObjectId'),
    body('body')
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
        .isAlphanumeric(),
    body('description')
        .trim()
        .isAlphanumeric()
]
export {deleteValidation, userValidation, bulkValidation, postValidation, commentValidation, roleValidation, commentsListValidation, postIdValidation}