const express = require('express')

// Instantiate Express app instance
const app = express()

// Set Root route handler
app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/yo', (req, res) => {
  res.send('Suuuup')
})

// Create Server listening on port 3000
// Capture server object to use data later
const server = app.listen(3000, () => {
  console.log(`App is running on port ${server.address().port}`)
})
