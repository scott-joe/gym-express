const express = require('express')
const fs = require('fs')
const path = require('path')
const cons = require('consolidate')
const utils = require('../utils')
const _ = require('lodash')

const router = express.Router({
  mergeParams: true,
})

const dataDir = path.join('..', 'data')

// Index
router.get('/', (_req, res) => {
  const users = []
  try {
    fs.readdir(path.join(__dirname, dataDir, 'users'), function (err, files) {
      if (err) throw err

      files.forEach(function (file) {
        try {
          const callback = (err, data) => {
            if (err) throw err
            const user = JSON.parse(data)

            users.push({
              username: user?.username,
              name: {
                ...user?.name,
                full: _.startCase(`${user?.name.first} ${user?.name.last}`),
              },
            })

            if (users.length === files.length) {
              users.sort(utils.compare)
              cons.handlebars(
                'views/index.hbs',
                { users },
                function (err, html) {
                  if (err) throw err
                  res.send(html)
                }
              )
            }
          }

          fs.readFile(
            path.join(__dirname, dataDir, 'users', file),
            utils.fsOpts,
            callback
          )
        } catch (error) {
          utils.log.error(error)
        }
      })
    })
  } catch (error) {
    utils.log.error(error)
  }
})

module.exports = router
