const people = require('../data/people.json')

function getDutiesForWeek(w) {
  const n = w - 1

  const firsts = people.slice(0, 15)
  const seconds = people.slice(15)

  const first = firsts[n - Math.floor(n / firsts.length) * firsts.length]
  const second = seconds[seconds.length - (n - Math.floor(n / seconds.length) * seconds.length) - 1]

  return [first, second]
}

module.exports = {
  getDutiesForWeek,
}
