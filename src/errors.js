'use strict'

const errcode = require('err-code')

const dbOpenFailedError = (err) => {
  err = err || new Error('Cannot open database')
  return errcode(err, 'ERR_DB_OPEN_FAILED')
}

const dbDeleteFailedError = (err) => {
  err = err || new Error('Delete failed')
  return errcode(err, 'ERR_DB_DELETE_FAILED')
}

const dbWriteFailedError = (err) => {
  err = err || new Error('Write failed')
  return errcode(err, 'ERR_DB_WRITE_FAILED')
}

const notFoundError = (err) => {
  err = err || new Error('Not Found')
  return errcode(err, 'ERR_NOT_FOUND')
}

const abortedError = (err) => {
  err = err || new Error('Aborted')
  return errcode(err, 'ERR_ABORTED')
}

module.exports = {
  dbOpenFailedError,
  dbDeleteFailedError,
  dbWriteFailedError,
  notFoundError,
  abortedError
}
