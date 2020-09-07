const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
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
        const date = moment(task.date)

        return date.isAfter(moment().subtract(1, 'days')) ? task : null
      })

      res.json({ tasks: filtered })
    })
})

module.exports = router
