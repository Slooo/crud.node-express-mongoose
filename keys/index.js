module.exports = {
  MONGODB_URI: `mongodb+srv://Robert:Rn548R6SAHPb2vde@cluster0-n7u6y.mongodb.net/shop`,
  SESSION_SECRET: 'some secret',
  SENDGRID_API_KEY: 'SG.t-XdhuU_RCOWxeyjxzGHFg.d5Ee3TNReW_xm6dxyThypRea-hEyVeb8xeGkT92HdEo',
  EMAIL_FROM: 'borisworking@gmail.com',
  PORT: process.env.PORT || 3000,
  BASE_URL: `http://localhost:${this.PORT}`
}
