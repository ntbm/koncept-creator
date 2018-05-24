const express = require('express')
const app = express()

function randomInteger(max) {
  return Math.floor(Math.random() * max)
}


// query param word
// return array of words with occurrences
app.get('/', (req, res) => {
  if (!req.query.word) return res.send([])
  const word = req.query.word
  const countOfWords = randomInteger(10)

  const result = new Array(countOfWords)
    .fill({name: '', count: 0})
    .map(({name, count}, index) => {
      name = word + index
      count = index
      return {name, count}
    })
  res.send(result)
})

const server = app.listen(8000, () => {
  console.log(`Server started at ${server.address().port}`)
})