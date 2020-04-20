const {Router} = require('express')
const bcrypt = require('bcryptjs')
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

// Авторизация
router.post('/signin', async (req, res) => {
  try {
    const {email, password} = req.body
    const candidate = await User.findOne({email})

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)
      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(error => {
          if (error) {
            throw Error
          }
          res.redirect('/')
        })
      } else {
        res.redirect('/auth/login/#signin')
      }
    } else {
      res.redirect('/auth/login/#signin')
    }
  } catch (e) {
    console.error(e)
  }
})

// Регистрация
router.post('/signup', async (req, res) => {
  try {
    const {remail: email, rpassword, confirm, name} = req.body
    const candidate = await User.findOne({email})

    if (candidate) {
      res.redirect('/auth/login/#signup')
    } else {
      const password = await bcrypt.hash(rpassword, 10)
      const user = new User({email, name, password, cart: {items: []}})
      await user.save()
      res.redirect('/auth/login/#signin')
    }
  } catch (e) {
    console.error(e)
  }
})

module.exports = router