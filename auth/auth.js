const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/User')
const sha = require('sha.js')
const chance = require('chance')()
require('dotenv').config()

passport.use(
  'adminLogin',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, next) => {
      return User.findOne({
        email: email,
      })
        .then((user) => {
          if (!user) {
            return next(null, false, {
              message: 'Incorrect username',
            })
          }

          if (user.isAdmin === 0) {
            return next(null, false, {
              message: `User ${user.Username} is not an admin`,
            })
          }

          if (
            sha('sha256')
              .update(password)
              .digest('hex') === user.password
          ) {
            return next(null, user, {
              message: 'Logged in successfully',
            })
          } else {
            return next(null, false, {
              message: 'Wrong password',
            })
          }
        })
        .catch((err) => next(err))
    },
  ),
)

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, next) => {
      if ((await User.findOne({ email: username }).count()) > 0) {
        return next(null, false, {
          message: 'User already exists',
        })
      }

      const newUser = new User({
        email: username,
        password: sha('sha256')
          .update(password)
          .digest('hex'),
        name: req.body.name,
        isAdmin: 0,
      })

      newUser
        .save()
        .then((user) => {
          next(null, user, {
            message: 'User created successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          next(err)
        })
    },
  ),
)

passport.use(
  'jwt',
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    (jwtPayload, next) => {
      next(null, jwtPayload)
    },
  ),
)

module.exports = passport
