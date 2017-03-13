/* @flow */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const each = require('async/each')
const map = require('async/map')
const parallel = require('async/parallel')
const pull = require('pull-stream')

const NamespaceStore = require('../src/').NamespaceDatastore
const Memory = require('../src').MemoryDatastore
const Key = require('../src').Key

describe('KeyTransformDatastore', () => {
  const prefixes = [
    'abc',
    ''
  ]
  prefixes.forEach((prefix) => it(`basic '${prefix}'`, (done) => {
    const mStore = new Memory()
    const store = new NamespaceStore(mStore, new Key(prefix))

    const keys = [
      'foo',
      'foo/bar',
      'foo/bar/baz',
      'foo/barb',
      'foo/bar/bazb',
      'foo/bar/baz/barb'
    ].map((s) => new Key(s))

    series([
      (cb) => each(keys, (k, cb) => {
        store.put(k, new Buffer(k.toString()), cb)
      }, cb),
      (cb) => parallel([
        (cb) => map(keys, (k, cb) => {
          store.get(k, cb)
        }, cb),
        (cb) => map(keys, (k, cb) => {
          mStore.get(new Key(prefix).child(k), cb)
        }, cb)
      ], (err, res) => {
        expect(err).to.not.exist
        expect(res[0]).to.eql(res[1])
        cb()
      }),
      (cb) => parallel([
        (cb) => pull(mStore.query({}), pull.collect(cb)),
        (cb) => pull(store.query({}), pull.collect(cb))
      ], (err, res) => {
        expect(err).to.not.exist
        expect(res[0]).to.have.length(res[1].length)

        res[0].forEach((a, i) => {
          const kA = a.key
          const kB = res[1][i].key
          expect(store.transform.invert(kA)).to.eql(kB)
          expect(kA).to.eql(store.transform.convert(kB))
        })

        cb()
      }),
      (cb) => store.close(cb)
    ], done)
  }))

  prefixes.forEach((prefix) => {
    describe(`interface-datastore: '${prefix}'`, () => {
      require('./interface')({
        setup (callback) {
          callback(null, new NamespaceStore(new Memory(), new Key(prefix)))
        },
        teardown (callback) {
          callback()
        }
      })
    })
  })
})
