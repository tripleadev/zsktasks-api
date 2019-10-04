const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const chance = require('chance')()
const moment = require('moment')
const fs = require('fs')
const { Task } = require('../models')
let timetable = JSON.parse(fs.readFile('../timetable.json'))

router.get('/', (req, res) => {
  return res.json({
    message: 'welcome to zskTasks-api',
  })
})

router.post(
  '/add',
  [
    check('title', 'Podaj tytuł zadania').isLength({ min: 4, max: 30 }),
    check('description', 'Podaj opis zadania').isLength({ min: 4, max: 500 }),
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

    let taskId, rows
    do {
      taskId = chance.bb_pin()
      rows = await Task.where('task_id', taskId).count()
    } while (rows > 0)

    const newTask = new Task({
      task_id: taskId,
      title: req.body.title,
      date: moment(req.body.date).format('YYYY-MM-DD'),
      description: req.body.description,
      subject: req.body.subject,
    })

    newTask
      .save(null, { method: 'insert' })
      .then(() => {
        res.status(200).json({
          message: 'Task created successfully',
          data: {
            title: req.body.title,
            date: moment(req.body.date).format('YYYY-MM-DD'),
            description: req.body.description,
            subject: req.body.subject,
          },
        })
      })
      .catch((err) => console.log(err))
  },
)

router.get('/all', (req, res) => {
  Task.forge()
    .orderBy('date')
    .fetchAll()
    .then((tasks) => {
      const filtered = tasks.filter((task) => {
        const date = moment(task.attributes.date)

        return date.isAfter(moment().subtract(1, 'days')) ? task : null
      })

      const responseObject = {
        tasks: [],
      }

      filtered.map((task) => {
        const d = moment(task.attributes.date)

        const correctedTask = {
          title: task.attributes.title,
          description: task.attributes.description,
          subject: task.attributes.subject,
          date: d.format('DD/MM/YYYY'),
          id: task.attributes.task_id,
        }

        responseObject.tasks.push(correctedTask)
      })

      res.json(responseObject)
    })
})

router.get('/timetable', (req, res) => {
  res.json(timetable)
})

module.exports = router
