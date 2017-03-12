/* @flow */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const pull = require('pull-stream')
const expect = require('chai').expect
const series = require('async/series')

const Key = require('../src').Key
const MountStore = require('../src').MountDatastore
const MemoryStore = require('../src').MemoryDatastore

describe('MountStore', () => {
  it('put - no mount', (done) => {
    const m = new MountStore([])

    m.put(new Key('hello'), new Buffer('foo'), (err) => {
      expect(err).to.be.an('Error')
      done()
    })
  })

  it('put - wrong mount', (done) => {
    const m = new MountStore([{
      datastore: new MemoryStore(),
      prefix: new Key('cool')
    }])

    m.put(new Key('/fail/hello'), new Buffer('foo'), (err) => {
      expect(err).to.be.an('Error')
      done()
    })
  })

  it('put', (done) => {
    const mds = new MemoryStore()
    const m = new MountStore([{
      datastore: mds,
      prefix: new Key('cool')
    }])

    const val = new Buffer('hello')
    series([
      (cb) => m.put(new Key('/cool/hello'), val, cb),
      (cb) => mds.get(new Key('/hello'), (err, res) => {
        expect(err).to.not.exist
        expect(res).to.eql(val)
        cb()
      })
    ], done)
  })

  it('get', (done) => {
    const mds = new MemoryStore()
    const m = new MountStore([{
      datastore: mds,
      prefix: new Key('cool')
    }])

    const val = new Buffer('hello')
    series([
      (cb) => mds.put(new Key('/hello'), val, cb),
      (cb) => m.get(new Key('/cool/hello'), (err, res) => {
        expect(err).to.not.exist
        expect(res).to.eql(val)
        cb()
      })
    ], done)
  })

  it('has', (done) => {
    const mds = new MemoryStore()
    const m = new MountStore([{
      datastore: mds,
      prefix: new Key('cool')
    }])

    const val = new Buffer('hello')
    series([
      (cb) => mds.put(new Key('/hello'), val, cb),
      (cb) => m.has(new Key('/cool/hello'), (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.eql(true)
        cb()
      })
    ], done)
  })

  it('delete', (done) => {
    const mds = new MemoryStore()
    const m = new MountStore([{
      datastore: mds,
      prefix: new Key('cool')
    }])

    const val = new Buffer('hello')
    series([
      (cb) => m.put(new Key('/cool/hello'), val, cb),
      (cb) => m.delete(new Key('/cool/hello'), cb),
      (cb) => m.has(new Key('/cool/hello'), (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.eql(false)
        cb()
      }),
      (cb) => mds.has(new Key('/hello'), (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.eql(false)
        cb()
      })
    ], done)
  })

  it('query simple', (done) => {
    const mds = new MemoryStore()
    const m = new MountStore([{
      datastore: mds,
      prefix: new Key('cool')
    }])

    const val = new Buffer('hello')
    series([
      (cb) => m.put(new Key('/cool/hello'), val, cb),
      (cb) => {
        pull(
          m.query({prefix: '/cool'}),
          pull.collect((err, res) => {
            expect(err).to.not.exist
            expect(res).to.eql([{
              key: new Key('/cool/hello'),
              value: val
            }])
            cb()
          })
        )
      }
    ], done)
  })

  describe('interface-datastore', () => {
    require('./interface')({
      setup (callback) {
        callback(null, new MountStore([{
          prefix: new Key('/a'),
          datastore: new MemoryStore()
        }, {
          prefix: new Key('/z'),
          datastore: new MemoryStore()
        }, {
          prefix: new Key('/q'),
          datastore: new MemoryStore()
        }]))
      },
      teardown (callback) {
        callback()
      }
    })
  })
})
