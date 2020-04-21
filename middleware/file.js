const multer = require('multer')

const storage = multer.diskStorage({
  // куда сохраняем файлы при загрузке на сервер
  destination(req, file, callback) {
    callback(null, 'images')
  },
  // имя файла
  filename(req, file, callback) {
    callback(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

// валидация на файл
const fileFilter = (req, file, callback) => {
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

// загрузка файлов
module.exports = multer({
  storage,
  fileFilter
})
