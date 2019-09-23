const databaseLoginData = require("./database.json")
const knex = require("knex")({ client: "mysql", connection: databaseLoginData })
const bookshelf = require("bookshelf")(knex)

const Task = bookshelf.Model.extend({
  tableName: "tasks"
})

const User = bookshelf.Model.extend({
  tableName: "users"
})

module.exports = {
  Task,
  User
}
