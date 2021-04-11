const express = require('express')
const utils = require('../utils')
const fs = require('fs')
const cons = require('consolidate')

const router = express.Router({
  mergeParams: true,
})

// Logging middleware for username calls
router.all('/', (req, _res, next) => {
  utils.log.console(`${req.method} for ${req.params.username}`)
  next()
})

// Get user
router.get('/', utils.verifyUser, (req, res) => {
  const username = req.params?.username
  // Fetch the current user's data out of the user store
  const user = utils.getUser(username)

  cons.handlebars(
    'views/user.hbs',
    { user: user, address: user.location },
    function (err, html) {
      if (err) throw err
      res.send(html)
    }
  )
})

// Update user
router.put('/', utils.verifyUser, (req, res) => {
  try {
    // Get username from params
    const username = req.params?.username
    // Get user data from file
    const user = utils.getUser(username)
    // Get location information from form submission
    user.location = req.body
    // save user data
    saveUser(username, user)
    // send response
    // res.end()
    res.status(200).send('User Updated')
  } catch (error) {
    utils.log.error(error)
    res.status(500).send(NODE_ENV ? 'Error updating user' : error)
    throw error
  }
})

// Delete user
router.delete('/', utils.verifyUser, (req, res) => {
  try {
    // get username
    const username = req.params.username
    const filename = utils.getUserFilePath(username)
    // delete user file
    fs.unlinkSync(filename)
    res.status(200).send('User Deleted')
  } catch (error) {
    utils.log.error(error)
    res.status(500).send(NODE_ENV ? 'Error deleting user' : error)
    throw error
  }
})

module.exports = router
