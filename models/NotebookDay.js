const mongoose = require('mongoose')

const notebookDaySchema = new mongoose.Schema({
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('NotebookDay', notebookDaySchema)
