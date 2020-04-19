const {Router} = require('express')
const User = require('../models/user')
const router = Router()

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login/#signin')
  })
})

router.post('/signin', async (req, res) => {
  const user = await User.findById('5e98c31c9f9d0672ddfaf48d')
  req.session.user = user
  req.session.isAuthenticated = true
  req.session.save(error => {
    if (error) {
      throw Error
    }
    res.redirect('/')
  })
  res.redirect('/')
})


module.exports = router
