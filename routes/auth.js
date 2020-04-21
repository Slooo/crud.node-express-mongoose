const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator/check')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const keys = require('../keys')
const reqEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {signUpValidators} = require('../utils/validators')
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
router.post('/signup', signUpValidators, async (req, res) => {
  try {
    const {remail: email, rpassword, name} = req.body

    const errors = validationResult(req)
    // если ошибки есть
    if (!errors.isEmpty()) {
      req.flash('signUpError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login/#signup')
    }

    const password = await bcrypt.hash(rpassword, 10)
    const user = new User({email, name, password, cart: {items: []}})
    await user.save()
    // отправка на почту
    await transporter.sendMail(reqEmail(email))
    res.redirect('/auth/login/#signin')
  } catch (e) {
    console.error(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset password?',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    // 1.Генерируем ключ
    crypto.randomBytes(32, async (error, buffer) => {
      if (error) {
        req.flash('error', 'Problem...')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      // 2. Проверяем есть ли данные юзер в БД
      const candidate = await User.findOne({email: req.body.email})

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000 // +1 час
        await candidate.save()
        await transporter.sendMail(candidate.email, token)
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'User not found')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.error(e)
  }
})

// страница восстановления пароля
router.get('/password/:token', async (req, res) => {
  if (req.params.token) {
    return res.redirect('/auth/login')
  }

  // если такой токен в БД есть и время не протухшее
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/new-password', {
        title: 'Recovery password',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.error(e)
  }
})

// задание нового пароля
router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (user) {
      user.password = await bcrypt(req.body.password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Time token failure')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.error(e)
  }
})

module.exports = router
