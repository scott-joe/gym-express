const express = require('express')
const fs = require('fs')
const _ = require('lodash')
const cons = require('consolidate')

// =================================
// ========== SET UP DATA ==========
// =================================
// Instantiate Users as empty array
const users = []
// Read static users.json file and parse results
fs.readFile('./data/users.json', { encoding: 'utf-8' }, (err, data) => {
  if (err) throw err

  JSON.parse(data).forEach((user) => {
    // Add Full Name Prop
    users.push({
      ...user,
      name: {
        ...user.name,
        full: _.startCase(`${user.name.first} ${user.name.last}`),
      },
    })
  })
})

// =================================
// ===== CONFIGURE APPLICATION =====
// =================================
// Instantiate Express app instance
const app = express()
// Set up images directory
app.use('/images', express.static('images'))

// User route
app.get('/:username', (req, res) => {
  const username = req.params?.username
  // const user = users.filter((x) => x.username === username)[0]
  // cons.handlebars('views/user.hbs', { user: user }, function (err, html) {
  cons.handlebars('views/user.hbs', { username }, function (err, html) {
    if (err) throw err
    res.send(html)
  })
})

// Set Root route handler
app.get('/', (_req, res) => {
  cons.handlebars('views/index.hbs', { users }, function (err, html) {
    if (err) throw err
    res.send(html)
  })
})

// =================================
// ========= START SERVER ==========
// =================================
// Create Server listening on port 3000 & capture server object to use later
const server = app.listen(3000, () => {
  console.log(`App is running on port ${server.address().port}`)
})
