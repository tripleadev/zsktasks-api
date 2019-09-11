const router = require("express").Router()
const { check, validationResult } = require("express-validator")
const chance = require("chance")()
const moment = require("moment")
const { Task } = require("./models")

router.get("/", (req, res) => {
  return res.json({
    message: "welcome to zskTasks-api"
  })
})

router.post(
  "/add",
  [
    check("title", "Podaj tytuł zadania").isLength({ min: 4, max: 30 }),
    check("description", "Podaj opis zadania").isLength({ min: 4, max: 500 }),
    check("date", "Podaj datę wykonania zadania").isISO8601(),
    check(
      "subject",
      "Podaj przedmiot, na który zostało zadane zadanie"
    ).isLength({ min: 2, max: 30 }),
    check("uploadCode").custom(code => {
      if (code === "ZadaniaPierwszaC") {
        return true
      } else {
        throw new Error("Zły kod zabezpieczający")
      }
    })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Errors in request",
        errors: errors
      })
    }

    let task_id, rows
    do {
      task_id = chance.bb_pin()
      rows = await Task.where("task_id", task_id).count()
    } while (rows > 0)

    const newTask = new Task({
      task_id: task_id,
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      subject: req.body.subject
    })

    newTask
      .save(null, { method: "insert" })
      .then(() => {
        res.status(200).json({
          message: "Task created successfully",
          data: {
            title: req.body.title,
            date: req.body.date,
            description: req.body.description,
            subject: req.body.subject
          }
        })
      })
      .catch(err => console.log(err))
  }
)

router.get("/all", (req, res) => {
  Task.fetchAll().then(tasks => {
    let responseObject = {
      tasks: []
    }

    tasks.map(task => {
      let d = moment(task.attributes.date)

      const correctedTask = {
        title: task.attributes.title,
        description: task.attributes.description,
        subject: task.attributes.subject,
        date: d.format("DD/MM/YYYY")
      }

      responseObject.tasks.push(correctedTask)
    })

    res.json(responseObject)
  })
})

module.exports = router
