const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const passport = require('passport')
const validator = require('validator')
const Task = require('../models/Task')

router.post(
  '/',
  [
    check('title', 'Podaj tytuł zadania').isLength({
      min: 4,
      max: 30,
    }),
    check('description', 'Podaj opis zadania').isLength({
      min: 4,
      max: 500,
    }),
    check('date', 'Podaj datę wykonania zadania').isISO8601(),
    check('subject', 'Podaj przedmiot, na który zostało zadane zadanie').isLength({
      min: 2,
      max: 30,
    }),
    check('uploadCode').custom((code) => {
      if (code === process.env.UPLOAD_CODE) {
        return true
      } else {
        throw new Error('Zły kod zabezpieczający')
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors: errors,
      })
    }

    const newTask = new Task({
      title: req.body.title,
      subject: req.body.subject,
      date: req.body.date,
      description: req.body.description,
    })

    newTask
      .save()
      .then((savedTask) => {
        res.status(201).json({
          message: 'Task created successfully',
          data: savedTask,
        })
      })
      .catch((err) => console.log(err))
  },
)

router.get('/', (req, res) => {
  Task.find({})
    .sort([['date', 'asc']])
    .then((tasks) => {
      const filtered = tasks.filter((task) => {
        const date = moment(task.date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

        return date.isAfter(moment().subtract(1, 'days'))
      })

      res.json({ tasks: filtered })
    })
})

router.delete(
  '/:task_id',
  passport.authorize('jwt', {}),
  [check('task_id', 'Podaj identyfikator zadania do usunięcia').isLength({ min: 1, max: 128 })],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors,
      })
    }
    return Task.deleteOne({ _id: req.params.task_id }, () => {
      res.json({
        message: `Successfully deleted the task with id: ${req.params.task_id}`,
      })
    })
  },
)

router.put(
  '/:task_id',
  passport.authorize('jwt', {}),
  [check('task_id', 'Podaj identyfikator zadania do zedytowania').isLength({ min: 1, max: 64 })],
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors: errors,
      })
    }

    let newAttributes = {}
    if (req.body.title && validator.isLength(req.body.title, { min: 4, max: 30 })) {
      newAttributes.title = req.body.title
    }
    if (req.body.description && validator.isLength(req.body.description, { min: 4, max: 500 })) {
      newAttributes.description = req.body.description
    }
    if (req.body.date && validator.isISO8601(req.body.date)) {
      newAttributes.date = req.body.date
    }
    if (req.body.subject && validator.isLength(req.body.subject, { min: 2, max: 30 })) {
      newAttributes.subject = req.body.subject
    }

    Task.findOneAndUpdate({ _id: req.params.task_id }, newAttributes)
      .then((task) => {
        res.json({
          message: 'Task corrected',
          task: task,
        })
      })
      .catch((err) => {
        console.log(err)
        res.status(400).json('Task not found')
      })
  },
)

router.get('/all', passport.authorize('jwt', {}), (req, res) => {
  Task.find({})
    .sort([['date', 'asc']])
    .then((tasks) => {
      return res.json({ tasks })
    })
})

module.exports = router
