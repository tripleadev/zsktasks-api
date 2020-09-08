const router = require('express').Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')

router.post('/login', (req, res, next) => {
  passport.authenticate('adminLogin', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is wrong',
        info: info,
      })
    }
    req.login(user, { session: false }, () => {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET,
      )
      return res.json({ token, user })
    })
  })(req, res, next)
})

router.post(
  '/register',
  [
    check('name').isLength({ min: 3, max: 80 }),
    check('email').isEmail(),
    check('password').exists(),
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors,
      })
    }
    passport.authenticate('register', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is wrong',
          info: info,
        })
      }
      return res.json({ message: 'Successfully created new user', user })
    })(req, res, next)
  },
)

router.get('/user', passport.authorize('jwt', {}), (req, res) => {
  User.findOne({ _id: req.account.userId }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "Can't find user" })
    }
    return res.json({
      message: 'User page',
      user,
    })
  })
})

module.exports = router
