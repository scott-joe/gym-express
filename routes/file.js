const express = require('express')
const utils = require('../utils')

const router = express.Router({
  mergeParams: true,
})

// Return user data as file download
router.get('/:username', (req, res) => {
  const filePath = utils.getUserFilePath(req.params.username)
  res.download(filePath)
})

module.exports = router
