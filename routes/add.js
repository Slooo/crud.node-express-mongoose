const {Router} = require('express')
const Course = require('../models/course')
const router = Router()

router.get('/', (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
})

router.post('/', async ({body}, res) => {
  const course = new Course({
    title: body.title,
    price: body.price,
    img: body.img
  })

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
