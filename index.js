const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('./auth/auth')

const router = require('./routes/tasks.router')
const adminRouter = require('./routes/admin.router')
const notebookRouter = require('./routes/notebook.router')
const dutiesRouter = require('./routes/duties.router')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 8080

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
  console.log('Database Connected'),
)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(passport.initialize())

app.use('/tasks', router)
app.use('/admin', adminRouter)
app.use('/notebookSchedule', notebookRouter)
app.use('/duties', dutiesRouter)

app.listen(port)
console.log(`Listening on port ${port}`)
