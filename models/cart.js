const path = require('path')
const fs = require('fs')

const p = path.join(
  process.mainModule.path,
  'data',
  'cart.json'
)

class Cart {
 static async add(course) {
   const cart = await Cart.fetch()

   const idx = cart.courses.findIndex(c => c.id === course.id)
   const candidate = cart.courses[idx]

   if (candidate) {
     // курс уже есть
     candidate.count++
     cart.courses[idx] = candidate
   } else {
     // добавляем
     course.count = 1
     cart.courses.push(course)
   }

   cart.totalPrice += +course.price

   return new Promise((resolve, reject) => {
     fs.writeFile(p, JSON.stringify(cart), (error) => {
        if(error) {
          reject(error)
        } else {
          resolve()
        }
     })
   })
 }

 static async remove(id) {
   const cart = await Cart.fetch()

   const idx = cart.courses.findIndex(c => c.id === id)
   const course = cart.courses[idx]

   if (course.count === 1) {
     // удалить
     cart.courses = cart.courses.filter(c => c.id !== id)
   } else {
     // изменить кол-во
     cart.courses[idx].count--
   }

   cart.price-= course.price

   return new Promise((resolve, reject) => {
     fs.writeFile(p, JSON.stringify(cart), (error) => {
       if(error) {
         reject(error)
       } else {
         resolve(cart)
       }
     })
   })
 }

 static async fetch() {
   return new Promise((resolve, reject) => {
     fs.readFile(p, 'utf-8', (error, content) => {
       if (error) {
         reject(error)
       } else {
         resolve(JSON.parse(content))
       }
     })
   })
 }
}

module.exports = Cart
