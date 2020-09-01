const mongoose = require('mongoose')

const notebookDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('NotebookDay', notebookDaySchema)
