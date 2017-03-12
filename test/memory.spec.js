/* @flow */
/* eslint-env mocha */
'use strict'

const MemoryDatastore = require('../src').MemoryDatastore

describe('Memory', () => {
  describe('interface-datastore', () => {
    require('./interface')({
      setup (callback) {
        callback(null, new MemoryDatastore())
      },
      teardown (callback) {
        callback()
      }
    })
  })
})
