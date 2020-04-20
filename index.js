const express = require('express')
const path = require('path')
const csrf = require('csurf')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const mongoose = require('mongoose')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')

const MONGODB_URI = `mongodb+srv://Robert:Rn548R6SAHPb2vde@cluster0-n7u6y.mongodb.net/shop`
const app = express()

// движок для рендеринга html страниц
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs', // для название engine
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

// конфиг сессии с БД
const store = new MongoStore({
  collection: 'sessions', // имя таблицы
  uri: MONGODB_URI
})

app.engine('hbs', hbs.engine) // регистрируем в экспрессе что есть движок hbs
app.set('view engine', 'hbs') // используем в экспрессе этот движок
app.set('views', 'views') // папки где будут шаблоны

app.use(express.static(path.join(__dirname, 'public'))) // статично подключаемый каталог
app.use(express.urlencoded({extended: true})) // парсим из буфера nodejs значения
app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false,
  store
})) // сессия
app.use(csrf()) // csrf защита
app.use(varMiddleware)
app.use(userMiddleware)
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch(e) {
    console.log(e)
  }
}

start()
