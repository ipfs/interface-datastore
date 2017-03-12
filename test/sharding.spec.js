/* @flow */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')

const Key = require('../src').Key
const ShardingStore = require('../src').ShardingDatastore
const MemoryStore = require('../src').MemoryDatastore
const sh = require('../src').shard

describe('ShardingStore', () => {
  it('create', (done) => {
    const ms = new MemoryStore()
    const shard = new sh.NextToLast(2)

    waterfall([
      (cb) => ShardingStore.create(ms, shard, cb),
      (cb) => parallel([
        (cb) => ms.get(new Key(sh.SHARDING_FN), cb),
        (cb) => ms.get(new Key(sh.README_FN), cb)
      ], cb),
      (res, cb) => {
        expect(
          res[0].toString()
        ).to.eql(
          shard.toString() + '\n'
        )
        expect(
          res[1].toString()
        ).to.eql(
          sh.readme
        )
        cb()
      }
    ], done)
  })

  it('open - empty', (done) => {
    const ms = new MemoryStore()

    ShardingStore.open(ms, (err, ss) => {
      expect(err).to.exist
      expect(ss).to.not.exist
      done()
    })
  })

  it('open - existing', (done) => {
    const ms = new MemoryStore()
    const shard = new sh.NextToLast(2)

    waterfall([
      (cb) => ShardingStore.create(ms, shard, cb),
      (cb) => ShardingStore.open(ms, cb)
    ], done)
  })

  it('basics', (done) => {
    const ms = new MemoryStore()
    const shard = new sh.NextToLast(2)
    ShardingStore.createOrOpen(ms, shard, (err, ss) => {
      expect(err).to.not.exist
      if (ss == null) {
        return done(new Error('missing store'))
      }
      const store = ss

      series([
        (cb) => store.put(new Key('hello'), new Buffer('test'), cb),
        (cb) => ms.get(new Key('ll').child(new Key('hello')), (err, res) => {
          expect(err).to.not.exist
          expect(res).to.eql(new Buffer('test'))
          cb()
        })
      ], done)
    })
  })

  // TODO: fix query prefix and orders
  describe.skip('interface-datastore', () => {
    require('./interface')({
      setup (callback) {
        const shard = new sh.NextToLast(2)
        ShardingStore.createOrOpen(new MemoryStore(), shard, callback)
      },
      teardown (callback) {
        callback()
      }
    })
  })
})
