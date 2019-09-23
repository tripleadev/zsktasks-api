const router = require("express").Router()
const passport = require("passport")
const jwt = require("jsonwebtoken")
const { User, Task } = require("../models")

router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err | !user) {
      return res.status(400).json({
        message: "Something is wrong",
        info: info
      })
    }
    req.login(user, { session: false }, () => {
      const token = jwt.sign(
        {
          userId: user.UserID
        },
        process.env.JWT_SECRET
      )
      return res.json({ token, user })
    })
  })(req, res, next)
})

router.get("/user", passport.authorize("jwt"), (req, res) => {
  return new User({ UserID: req.account.userId }).fetch().then(user => {
    if (!user) {
      return res.status(400).json({ message: "Can't find user" })
    }
    return res.json({
      message: "User page",
      user
    })
  })
})

router.delete("/delete_task", passport.authorize("jwt"), (req, res) => {
  return new Task()
    .where({ task_id: req.body.task_id })
    .destroy()
    .then(() => {
      res.json({
        message: `Successfully deleted the task with id: ${req.body.task_id}`
      })
    })
})

module.exports = router
