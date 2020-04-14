const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const mongoose = require('mongoose')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const User = require('./models/user')

const app = express()

// движок для рендеринга html страниц
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs', // для название engine
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine) // регистрируем в экспрессе что есть движок hbs
app.set('view engine', 'hbs') // используем в экспрессе этот движок
app.set('views', 'views') // папки где будут шаблоны

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('5e96098bc18ab8c91507abdc')
    req.user = user
    next()
  } catch (e) {
    console.error(e)
  }
})

app.use(express.static(path.join(__dirname, 'public'))) // статично подключаемый каталог
app.use(express.urlencoded({extended: true})) // парсим из буфера nodejs значения
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    const url = `mongodb+srv://Robert:Rn548R6SAHPb2vde@cluster0-n7u6y.mongodb.net/shop`
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    const candidate = await User.findOne()
    if (!candidate) {
      const user = new User({
        email: 'robert@gmail.com',
        name: 'Robert',
        cart: {items: []}
      })
      await user.save()
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch(e) {
    console.log(e)
  }
}

start()
