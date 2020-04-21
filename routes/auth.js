const {Router} = require('express')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const keys = require('../keys')
const reqEmail = require('../emails/registration')
const router = Router()

// Конфиг с sendgrid сервисом
const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true,
    signUpError: req.flash('signUpError'),
    signInError: req.flash('signInError'),
    error: req.flash('error')
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
        req.flash('signInError', 'This password in not coincides')
        res.redirect('/auth/login/#signin')
      }
    } else {
      req.flash('signInError', 'This user is not found')
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
      req.flash('signUpError', 'This user busy')
      res.redirect('/auth/login/#signup')
    } else {
      const password = await bcrypt.hash(rpassword, 10)
      const user = new User({email, name, password, cart: {items: []}})
      await user.save()
      res.redirect('/auth/login/#signin')
      // отправка на почту
      await transporter.sendMail(reqEmail(email))
    }
  } catch (e) {
    console.error(e)
  }
})

module.exports = router
