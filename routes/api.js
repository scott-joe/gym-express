const express = require('express')
const path = require('path')
const JSONStream = require('JSONStream')
const utils = require('../utils')

const router = express.Router({
  mergeParams: true,
})

// Return user data as JSON
router.get('/:username', utils.verifyUser, (req, res) => {
  const username = req.params?.username
  const user = utils.getUser(username)
  res.json(user)
})

// Return user data as JSON
router.get('/filter/gender/:gender', utils.verifyUser, (req, res) => {
  const gender = req.params?.gender
  const userFile = path.join(__dirname, '..', 'data', 'users.json')
  const readStream = fs.createReadStream(userFile)
  readStream.pipe(res)
})

module.exports = router
