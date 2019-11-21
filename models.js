const databaseLoginData = require('./database.json')
const knex = require('knex')({ client: 'mysql', connection: databaseLoginData })
const bookshelf = require('bookshelf')(knex)

const Task = bookshelf.Model.extend({
  tableName: 'tasks',
})

const User = bookshelf.Model.extend({
  tableName: 'users',
  notebookDays() {
    return this.hasMany(NotebookDay, 'UserID')
  },
})

const NotebookDay = bookshelf.Model.extend({
  tableName: 'notebook',
  user() {
    return this.belongsTo(User, 'userID', 'UserID')
  },
})

module.exports = {
  Task,
  User,
  NotebookDay,
}
