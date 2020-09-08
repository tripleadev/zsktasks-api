const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const NotebookDay = require('../models/NotebookDay')
const passport = require('passport')

router.get('/', (req, res) => {
  NotebookDay.find({}).then((days) => {
    res.json(days)
  })
})

router.post(
  '/',
  passport.authorize('jwt', {}),
  [check('comment').exists(), check('date').isISO8601()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errors in request',
        errors,
      })
    }

    const newDay = new NotebookDay({
      date: req.body.date,
      comment: req.body.comment,
      name: req.body.name,
    })

    newDay
      .save()
      .then(() => {
        return res.json({
          message: 'Success',
          notebookDay: newDay,
        })
      })
      .catch((err) => {
        return res.json({
          message: err,
        })
      })
  },
)

router.delete('/:date', passport.authorize('jwt', {}), [check('date').isISO8601()], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errors in request',
      errors,
    })
  }
  NotebookDay.findOne({ date: req.params.date })
    .remove()
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
