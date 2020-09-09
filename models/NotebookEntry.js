const mongoose = require('mongoose')

const notebookEntrySchema = new mongoose.Schema({
  cycle: {
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
