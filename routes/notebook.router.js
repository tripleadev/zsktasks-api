const router = require('express').Router()
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const { NotebookDay, User } = require('../models')
const passport = require('passport')

router.get('/', (req, res) => {
  new NotebookDay()
    .orderBy('date', 'asc')
    .fetchAll({ withRelated: ['user'] })
    .then((days) => {
      res.json(days)
    })
})

router.post(
  '/addDay',
  passport.authorize('jwt', {}),
  [check('username').exists(), check('date').isISO8601()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errors in request',
        errors,
      })
    }
    User.where({ Name: req.body.username })
      .fetch()
      .then((user) => {
        if (!user) {
          return res.status(400).json({
            message: `Can't find any user with given name and surname`,
          })
        }
        const newDay = new NotebookDay({
          userID: user.attributes.UserID,
          date: moment(req.body.date).format('YYYY-MM-DD'),
          comment: req.body.comment,
        })
        newDay
          .save(null, { method: 'insert' })
          .then(() => {
            return res.json({
              message: 'Success',
              notebookDay: newDay,
            })
          })
          .catch((err) => {
            return res.json({
              message: err.sqlMessage,
            })
          })
      })
  },
)

router.post(
  '/deleteDay',
  passport.authorize('jwt', {}),
  [check('date').isISO8601()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errors in request',
        errors,
      })
    }
    NotebookDay.where({ date: req.body.date })
      .destroy()
      .then(() => {
        res.json({
          message: 'Sucessfully deleted entry',
        })
      })
      .catch((err) => {
        return res.json({
          message: 'Error while deleting entry',
          err,
        })
      })
  },
)

module.exports = router
