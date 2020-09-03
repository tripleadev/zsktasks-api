const router = require('express').Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const validator = require('validator')
const User = require('../models/User')
const Task = require('../models/Task')

router.post('/login', (req, res, next) => {
  passport.authenticate('adminLogin', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is wrong',
        info: info,
      })
    }
    req.login(user, { session: false }, () => {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        process.env.JWT_SECRET,
      )
      return res.json({ token, user })
    })
  })(req, res, next)
})

router.post(
  '/register',
  [
    check('name').isLength({ min: 3, max: 80 }),
    check('email').isEmail(),
    check('password').exists(),
  ],
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors,
      })
    }
    passport.authenticate('register', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is wrong',
          info: info,
        })
      }
      return res.json({ message: 'Successfully created new user', user })
    })(req, res, next)
  },
)

router.get('/user', passport.authorize('jwt', {}), (req, res) => {
  User.findOne({ _id: req.account.userId }).then((user) => {
    if (!user) {
      return res.status(404).json({ message: "Can't find user" })
    }
    return res.json({
      message: 'User page',
      user,
    })
  })
})

router.post(
  '/delete_task',
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
    return Task.deleteOne({ _id: req.body.task_id }, () => {
      res.json({
        message: `Successfully deleted the task with id: ${req.body.task_id}`,
      })
    })
  },
)

router.post(
  '/edit_task',
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

    Task.findOneAndUpdate({ _id: req.body.task_id }, newAttributes)
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
  Task.find({}).then((tasks) => {
    let correctedTasks = []

    tasks.map((task) => {
      const d = moment(task.date)

      const correctedTask = {
        title: task.title,
        description: task.description,
        subject: task.subject,
        date: d.format('DD/MM/YYYY'),
        id: task._id,
      }

      correctedTasks.push(correctedTask)
    })

    return res.json({ tasks: correctedTasks })
  })
})

module.exports = router
