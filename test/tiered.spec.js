/* @flow */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const parallel = require('async/parallel')

const Key = require('../src').Key
const TieredStore = require('../src').TieredDatastore
const MemoryStore = require('../src').MemoryDatastore

describe('Tiered', () => {
  describe('all stores', () => {
    let ms = []
    let store
    beforeEach(() => {
      ms.push(new MemoryStore())
      ms.push(new MemoryStore())
      store = new TieredStore(ms)
    })

    it('put', (done) => {
      const k = new Key('hello')
      const v = new Buffer('world')
      series([
        (cb) => store.put(k, v, cb),
        (cb) => parallel([
          (cb) => ms[0].get(k, cb),
          (cb) => ms[1].get(k, cb)
        ], (err, res) => {
          expect(err).to.not.exist
          res.forEach((val) => {
            expect(val).to.be.eql(v)
          })
          cb()
        })
      ], done)
    })

    it('get and has, where available', (done) => {
      const k = new Key('hello')
      const v = new Buffer('world')

      series([
        (cb) => ms[1].put(k, v, cb),
        (cb) => store.get(k, (err, val) => {
          expect(err).to.not.exist
          expect(val).to.be.eql(v)
          cb()
        }),
        (cb) => store.has(k, (err, exists) => {
          expect(err).to.not.exist
          expect(exists).to.be.eql(true)
          cb()
        })
      ], done)
    })

    it('has and delete', (done) => {
      const k = new Key('hello')
      const v = new Buffer('world')
      series([
        (cb) => store.put(k, v, cb),
        (cb) => parallel([
          (cb) => ms[0].has(k, cb),
          (cb) => ms[1].has(k, cb)
        ], (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql([true, true])
          cb()
        }),
        (cb) => store.delete(k, cb),
        (cb) => parallel([
          (cb) => ms[0].has(k, cb),
          (cb) => ms[1].has(k, cb)
        ], (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql([false, false])
          cb()
        })
      ], done)
    })
  })

  describe('inteface-datastore-single', () => {
    require('./interface')({
      setup (callback) {
        callback(null, new TieredStore([
          new MemoryStore(),
          new MemoryStore()
        ]))
      },
      teardown (callback) {
        callback()
      }
    })
  })
})
