const keys = require('../keys')

module.exports = function(email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Registration success!',
    html: `
      <h1>Dobro pojalovat!</h1>
      <p>Success registration! - ${email}</p>
      <hr/>
      <a href="${keys.BASE_URL}">Get to courses shop</a>
    `
  }
}
