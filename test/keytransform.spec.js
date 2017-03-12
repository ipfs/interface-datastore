/* @flow */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const each = require('async/each')
const map = require('async/map')
const parallel = require('async/parallel')
const pull = require('pull-stream')

const KeytransformStore = require('../src/').KeytransformDatastore
const Memory = require('../src').MemoryDatastore
const Key = require('../src').Key

describe('KeyTransformDatastore', () => {
  it('basic', (done) => {
    const mStore = new Memory()
    const transform = {
      convert (key) {
        return new Key('/abc').child(key)
      },
      invert (key) {
        const l = key.list()
        if (l[0] !== 'abc') {
          throw new Error('missing prefix, convert failed?')
        }
        return Key.withNamespaces(l.slice(1))
      }
    }

    const kStore = new KeytransformStore(mStore, transform)

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
        kStore.put(k, new Buffer(k.toString()), cb)
      }, cb),
      (cb) => parallel([
        (cb) => map(keys, (k, cb) => {
          kStore.get(k, cb)
        }, cb),
        (cb) => map(keys, (k, cb) => {
          mStore.get(new Key('abc').child(k), cb)
        }, cb)
      ], (err, res) => {
        expect(err).to.not.exist
        expect(res[0]).to.eql(res[1])
        cb()
      }),
      (cb) => parallel([
        (cb) => pull(mStore.query({}), pull.collect(cb)),
        (cb) => pull(kStore.query({}), pull.collect(cb))
      ], (err, res) => {
        expect(err).to.not.exist
        expect(res[0]).to.have.length(res[1].length)

        res[0].forEach((a, i) => {
          const kA = a.key
          const kB = res[1][i].key
          expect(transform.invert(kA)).to.eql(kB)
          expect(kA).to.eql(transform.convert(kB))
        })

        cb()
      }),
      (cb) => kStore.close(cb)
    ], done)
  })
})
