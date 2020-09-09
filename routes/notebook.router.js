const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const NotebookEntry = require('../models/NotebookEntry')
const passport = require('passport')

router.get('/', (req, res) => {
  NotebookEntry.find({}).then((days) => {
    res.json(days)
  })
})

router.post(
  '/',
  passport.authorize('jwt', {}),
  [check('comment').exists(), check('name').exists(), check('cycle').isNumeric()],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errors in request',
        errors,
      })
    }

    const newDay = new NotebookEntry({
      cycle: req.body.cycle,
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

router.delete('/:id', passport.authorize('jwt', {}), [check('id').exists()], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errors in request',
      errors,
    })
  }
  NotebookEntry.findById(req.params.id)
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
