const express = require('express')
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

module.exports = router
