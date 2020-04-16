const {Router} = require('express')
const Course = require('../models/course')
const router = Router()

router.get('/', async (req, res) => {
  const courses = await Course.find()
    .populate('userId', 'email name') // с БД юзера по связке достаем
    .select('price title img') // c БД Courses

  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    courses
  })
})

router.get('/:id/edit', async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findById(req.params.id)

  res.render('edit', {
    title: `Edit course ${course.title}`,
    course
  })
})

router.post('/edit', async ({body}, res) => {
  // TODO: ругается если url картинки не найден!
  await Course.findByIdAndUpdate(body.id, {
    title: body.title,
    price: body.price,
    url: body.url
  })
  res.redirect('/courses')
})

router.post('/delete', async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id})
    res.redirect('/courses')
  } catch (e) {
    console.error(e)
  }
})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  res.render('course', {
    layout: 'empty',
    title: `Course ${course.title}`,
    course
  })
})

module.exports = router
