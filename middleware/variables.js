module.exports = function(req, res, next) {
  const token = req.csrfToken()
  res.locals.isAuth = req.session.isAuthenticated
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrf = token
  next()
}
