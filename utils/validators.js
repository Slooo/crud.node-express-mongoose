const {body} = require('express-validator/check')
const User = require('../models/user')

exports.registerValidators = [
  body('remail').isEmail().withMessage('Incorrect email').custom(
    async (value, {req}) => {
      try {
        const candidate = await User.findOne({email: value})
        if (candidate) {
          return Promise.reject('User is busy')
        }
      } catch (e) {
        console.error(e)
      }
    }
  ),
  body('rpassword', 'Password min 6, max 56 symbol').isLength({min: 6, max: 56}).isAlphanumeric(),
  body('confirm').custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error('Password must match')
    }
    return true
  }),
  body('name').isLength({min: 3}).withMessage('Name min 3 symbol')
]
