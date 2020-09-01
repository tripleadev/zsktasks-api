const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const { getDutiesForWeek } = require('../data/duties')

function getLastSunday(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) - 1

  return new Date(date.setDate(diff))
}

function getWeekOfSchool(date) {
  let firstDay

  firstDay = new Date()
  firstDay.setMonth(8)
  firstDay.setDate(1)
  firstDay.setSeconds(0)

  if (date.getMonth() < 8) {
    firstDay.setFullYear(date.getFullYear() - 1)
  } else {
    firstDay.setFullYear(date.getFullYear())
  }

  const monday = moment(getLastSunday(firstDay))

  return moment(date).diff(monday, 'weeks')
}

router.get(
  '/',
  [
    check('date')
      .isISO8601()
      .optional(),
  ],
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Errors in request',
        errors,
      })
    }

    const today = req.query.date ? new Date(req.query.date) : new Date()

    const weekOfSchool = getWeekOfSchool(today)

    res.json({ duties: getDutiesForWeek(weekOfSchool + 1) })
  },
)

module.exports = router
