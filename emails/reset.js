const keys = require('../keys')

module.exports = function(email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Recovery password',
    html: `
      <h1>Zabili parol?!</h1>
      <p>Esli net, to ignore this mail</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">Recovery password this link</a></p>
      <hr/>
      <a href="${keys.BASE_URL}">Get to courses shop</a>
    `
  }
}
