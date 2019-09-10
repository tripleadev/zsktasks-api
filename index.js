const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 8080

app.get("/", (req, res) => {
  return res.json({
    message: "hello"
  })
})

app.listen(port)
console.log(`Listening on port ${port}`)
