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

          if (sha('sha256').update(password).digest('hex') === user.attributes.Pass) {
            return next(null, user.attributes, {
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
      if ((await User.where('Username', username).count()) > 0) {
        return next(null, false, {
          message: 'User already exists',
        })
      }

      let userID
      do {
        userID = chance.bb_pin()
      } while (User.where('UserID', userID).count() > 0)

      const newUser = new User({
        UserID: userID,
        Username: username,
        Pass: sha('sha256').update(password).digest('hex'),
        Name: req.body.name,
        isAdmin: 0,
      })

      newUser
        .save(null, {
          method: 'insert',
        })
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
