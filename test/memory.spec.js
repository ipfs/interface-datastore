/* @flow */
/* eslint-env mocha */
'use strict'

const MemoryDatastore = require('../src').MemoryDatastore

describe('Memory', () => {
  describe('interface-datastore', () => {
    require('../src/tests')({
      setup () {
        return new MemoryDatastore()
      },
      teardown () {}
    })
  })
})
