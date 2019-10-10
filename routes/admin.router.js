const router = require('express').Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const validator = require('validator')
const { User, Task } = require('../models')

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is wrong',
        info: info,
      })
    }
    req.login(user, { session: false }, () => {
      const token = jwt.sign(
        {
          userId: user.UserID,
        },
        process.env.JWT_SECRET,
      )
      return res.json({ token, user })
    })
  })(req, res, next)
})

router.post('/register', [
  check('name').isLength({ min: 3, max: 80 }),
  check('email').isEmail(),
  check('password').exists(),
  check('adminCode').exists()
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Errors in request',
      errors
    })
  }
  passport.authenticate('register', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is wrong',
        info: info,
      })
    }
    req.login(user, { session: false }, () => {
      const loginToken = jwt.sign(
        {
          userId: user.UserID,
        },
        process.env.JWT_SECRET,
      )
      return res.json({ message: 'Successfully created new user', loginToken, user })
    })
  })(req, res, next)
})

router.get('/user', passport.authorize('jwt', {}), (req, res) => {
  return new User({ UserID: req.account.userId }).fetch().then((user) => {
    if (!user) {
      return res.status(400).json({ message: "Can't find user" })
    }
    return res.json({
      message: 'User page',
      user,
    })
  })
})

router.delete('/delete_task', passport.authorize('jwt', {}), [
  check('task_id', 'Podaj identyfikator zadania do usunięcia').isLength({ min: 8, max: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Errors in request',
      errors
    })
  }
  return new Task()
    .where({ task_id: req.body.task_id })
    .destroy()
    .then(() => {
      res.json({
        message: `Successfully deleted the task with id: ${req.body.task_id}`,
      })
    })
})

router.post('/edit_task', passport.authorize('jwt', {}), [
  check('task_id', 'Podaj identyfikator zadania do usunięcia').isLength({ min: 8, max: 8 })
], (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Errors in request',
      errors: errors,
    })
  }
  console.log(req.body.task_id)
  Task.where('task_id', req.body.task_id).fetch().then((task) => {
    if (validator.isLength(req.body.title, { min: 4, max: 30 })) { task.set('title', req.body.title) }
    if (validator.isLength(req.body.description, { min: 4, max: 500 })) { task.set('description', req.body.description) }
    if (validator.isISO8601(req.body.date)) { task.set('date', req.body.date) }
    if (validator.isLength(req.body.subject, { min: 2, max: 30 })) { task.set('subject', req.body.subject) }

    task.save(null, { method: 'update', patch: 'true' }).then(task => {
      res.json({
        message: 'Task corrected',
        task: task.attributes
      })
    })
  }).catch(err => {
    console.log(err)
    res.status(400).json('Task not found')
  })
})

router.get('/all', passport.authorize('jwt', {}), (req, res) => {
  Task.forge()
    .orderBy('date')
    .fetchAll()
    .then((tasks) => {
      let correctedTasks = []

      tasks.map((task) => {
        const d = moment(task.attributes.date)

        const correctedTask = {
          title: task.attributes.title,
          description: task.attributes.description,
          subject: task.attributes.subject,
          date: d.format('DD/MM/YYYY'),
          id: task.attributes.task_id
        }

        correctedTasks.push(correctedTask)
      })

      return res.json({ tasks: correctedTasks })
    })
})

module.exports = router
