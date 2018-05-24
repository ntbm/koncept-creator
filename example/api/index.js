const express = require('express')
const app = express()

function randomInteger(max) {
  return Math.floor(Math.random() * max)
}
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8181')
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers',
    'content-type, auth-token, user, X-XSRF-TOKEN')
  res.setHeader('Access-Control-Allow-Credentials', true)

  // Check if preflight request
  if (req.method === 'OPTIONS') {
    res.status(200)
    res.end()
  } else {
    next()
  }
})


// query param word
// return array of words with occurrences
app.get('/', (req, res) => {
  if (!req.query.word) return res.send([])
  const word = req.query.word
  const countOfWords = randomInteger(10)
  console.log(`GET /: word: ${word}, count: ${countOfWords}`)

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