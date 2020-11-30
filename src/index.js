'use strict'

const Key = require('./key')
const MemoryDatastore = require('./memory')
const utils = require('./utils')
const Errors = require('./errors')
const Adapter = require('./adapter')

module.exports = {
  Key,
  MemoryDatastore,
  utils,
  Errors,
  Adapter
}
