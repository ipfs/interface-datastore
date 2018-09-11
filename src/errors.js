'use strict'

const errcode = require('err-code')

module.exports.ERR_DB_CANNOT_OPEN = (err) => {
  err = err || new Error('Cannot open database')
  return errcode(err, 'ERR_CANNOT_OPEN_DB')
}

module.exports.ERR_DB_DELETE_FAILED = (err) => {
  err = err || new Error('Delete failed')
  return errcode(err, 'ERR_DB_DELETE_FAILED')
}

module.exports.ERR_DB_WRITE_FAILED = (err) => {
  err = err || new Error('Write failed')
  return errcode(err, 'ERR_DB_WRITE_FAILED')
}

module.exports.ERR_NOT_FOUND = (err) => {
  err = err || new Error('Not Found')
  return errcode(err, 'ERR_NOT_FOUND')
}
