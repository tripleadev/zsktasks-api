const people = [
  {
    name: '1',
  },
  {
    name: '2',
  },
  {
    name: '3',
  },
  {
    name: '4',
  },
  {
    name: '5',
  },
  {
    name: '6',
  },
  {
    name: '7',
  },
  {
    name: '8',
  },
  {
    name: '9',
  },
  {
    name: '10',
  },
  {
    name: '11',
  },
  {
    name: '12',
  },
  {
    name: '13',
  },
  {
    name: '14',
  },
  {
    name: '15',
  },
  {
    name: '16',
  },
  {
    name: '17',
  },
  {
    name: '18',
  },
  {
    name: '19',
  },
  {
    name: '20',
  },
  {
    name: '21',
  },
  {
    name: '22',
  },
  {
    name: '23',
  },
  {
    name: '24',
  },
  {
    name: '25',
  },
  {
    name: '26',
  },
  {
    name: '27',
  },
  {
    name: '28',
  },
  {
    name: '29',
  },
]

const weeks = []

for (let i = 0; i < people.length / 2; i++) {
  weeks.push([people[i], people[people.length - i - 1]])
}

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
