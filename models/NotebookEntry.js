const mongoose = require('mongoose')

const notebookEntrySchema = new mongoose.Schema({
  weekCycle: {
    type: Number,
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

module.exports = mongoose.model('NotebookEntry', notebookEntrySchema)
