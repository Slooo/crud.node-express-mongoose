const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = new Router()

function mapCartItems(cart) {
  return cart.items.map(c => ({
    // достается из mongo _doc для того чтобы вытащить только нужное
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count
  }))
}

function computePrice(courses) {
  return courses.reduce((total, course) => total += course.price * course.count, 0)
}

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id)
  // user это сущность БД
  await req.user.addToCart(course)
  res.redirect('/cart')
})

router.get('/', auth, async (req, res) => {
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

  const courses = mapCartItems(user.cart)

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses,
    totalPrice: computePrice(courses)
  })
})

router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.deleteFromCart(req.params.id)
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

  const courses = mapCartItems(user.cart)

  res.status(200).json({
    courses,
    price: computePrice(courses)
  })
})

module.exports = router
