const databaseLoginData = require("./database.json")
const knex = require("knex")({ client: "mysql", connection: databaseLoginData })
const bookshelf = require("bookshelf")(knex)

const Task = bookshelf.Model.extend({
  tableName: "tasks"
})

module.exports = {
  Task
}
