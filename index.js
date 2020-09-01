const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('./auth/auth')

const router = require('./routes/router')
const adminRouter = require('./routes/admin.router')
const notebookRouter = require('./routes/notebook.router')
const dutiesRouter = require('./routes/duties.router')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(passport.initialize())

app.use('/', router)
app.use('/admin', adminRouter)
app.use('/notebookSchedule', notebookRouter)
app.use('/duties', dutiesRouter)

app.listen(port)
console.log(`Listening on port ${port}`)
