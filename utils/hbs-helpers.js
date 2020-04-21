// Проверка равенства для hbs шаблонов
module.exports = {
  ifeq(a, b, options) {
    // TODO: "a" приходит не как строка
    if (a == b) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
