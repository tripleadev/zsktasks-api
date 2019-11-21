const router = require('express').Router()
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const { NotebookDay, User } = require('../models')

router.get('/', (req, res) => {
  NotebookDay.fetchAll({ withRelated: ['user'] }).then((days) => {
    res.json(days)
  })
})

router.post(
  '/addDay',
  [check('userID').isLength({ min: 8, max: 8 }), check('date').isISO8601()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errors in request',
        errors,
      })
    }
    User.where({ userID: req.body.userID })
      .fetch()
      .then((user) => {
        if (!user) {
          return res.status(400).json({
            message: `UserID doesn't relate to any user`,
          })
        }
        const newDay = new NotebookDay({
          userID: req.body.userID,
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
              message: 'Error while adding new entry',
              error: err.sqlMessage,
            })
          })
      })
  },
)

router.post('/deleteDay', [check('date').isISO8601()], (req, res) => {
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
})

module.exports = router
