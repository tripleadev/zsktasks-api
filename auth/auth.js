const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const JWTStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const { User } = require("../models")
const sha = require("sha.js")
require("dotenv").config()

passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, next) => {
      return new User({ Username: email })
        .fetch()
        .then(user => {
          if (!user) {
            return next(null, false, {
              message: "Incorrect username"
            })
          }

          if (
            sha("sha256")
              .update(password)
              .digest("hex") === user.attributes.Pass
          ) {
            return next(null, user.attributes, {
              message: "Logged in successfully"
            })
          } else {
            return next(null, false, {
              message: "Wrong password"
            })
          }
        })
        .catch(err => next(err))
    }
  )
)

passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    (jwtPayload, next) => {
      next(null, jwtPayload)
    }
  )
)

module.exports = passport
