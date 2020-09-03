const mongoose = require('mongoose')

const notebookDaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('NotebookDay', notebookDaySchema)
