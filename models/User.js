const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: Date,
    required: true,
  },
  isAdmin: Boolean,
})

module.exports = mongoose.model('User', userSchema)
