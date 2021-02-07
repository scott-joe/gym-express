const express = require('express')
const utils = require('../utils')

const router = express.Router({
  mergeParams: true,
})

// Handle bad usernames
router.get('/:username', (req, res) => {
  utils.log.error(`${req.method} for ${req.params.username}`)
  res
    .status(404)
    .send(`<h4>No user named <u>${req.params.username}</u> found</h4>`)
})

module.exports = router
