const {body} = require('express-validator/check')
const User = require('../models/user')

exports.signUpValidators = [
  body('remail')
    .isEmail().withMessage('Incorrect email')
    .custom(async (value, {req}) => {
      try {
        const candidate = await User.findOne({email: value})
        if (candidate) {
          return Promise.reject('User is busy')
        }
      } catch (e) {
        console.error(e)
      }
    })
    .normalizeEmail(),
  body('rpassword', 'Password min 6, max 56 symbol')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password must match')
      }
      return true
    })
    .trim(),
  body('name', 'Name min 3 symbol')
    .isLength({min: 3})
    .trim()
]

exports.courseValidators = [
  body('title').isLength({min: 3}).withMessage('Min length is 3').trim(),
  body('price').isNumeric().withMessage('Write correct price'),
  body('img', 'Write correct URL image').isURL()
]
