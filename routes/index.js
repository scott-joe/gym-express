const express = require('express')

const router = express.Router({
  mergeParams: true,
})

// API routes
const apiRouter = require('./api')
router.use('/api', apiRouter)

// File routes
const fileRouter = require('./file')
router.use('/file', fileRouter)

// Error routes
const errorRouter = require('./error')
router.use('/error', errorRouter)

// User routes
const userRouter = require('./user')
router.use('/:username', userRouter)

// Home routes
const homeRouter = require('./home')
router.use('/', homeRouter)

// Exports
module.exports = router
