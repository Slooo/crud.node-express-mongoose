const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const mongoose = require('mongoose')
const helmet = require('helmet')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorMiddleware = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys')

const app = express()

// движок для рендеринга html страниц
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs', // для название engine
  helpers: require('./utils/hbs-helpers'),
  handlebars: allowInsecurePrototypeAccess(Handlebars),
})

// конфиг сессии с БД
const store = new MongoStore({
  collection: 'sessions', // имя таблицы
  uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine) // регистрируем в экспрессе что есть движок hbs
app.set('view engine', 'hbs') // используем в экспрессе этот движок
app.set('views', 'views') // папки где будут шаблоны

app.use(express.static(path.join(__dirname, 'public'))) // статично подключаемый каталог
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true})) // парсим из буфера nodejs значения
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))
// single - название поля file input
app.use(fileMiddleware.single('avatar'))
app.use(csrf()) // csrf защита
app.use(flash()) // flash session
app.use(helmet())
app.use(varMiddleware)
app.use(userMiddleware)
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

// 404 page
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    app.listen(keys.PORT, () => {
      console.log(`Server is running on port ${keys.PORT}`)
    })
  } catch(e) {
    console.log(e)
  }
}

start()
