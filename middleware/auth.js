// Проверка авторизации для роутеров
module.exports = function(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/login/#signin')
  }

  next()
}
