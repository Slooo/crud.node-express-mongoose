const User = require('../models/user')

// Связываем методы юзера с сессии и БД
module.exports = async function(req, res, next) {
  if (!req.session.user) {
    return next()
  }

  req.user = await User.findById(req.session.user._id)

  next()
}
