/* @flow */
/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const utils = require('../src').utils

describe('utils', () => {
  it('asyncFilter - sync', (done) => {
    pull(
      pull.values([1, 2, 3, 4]),
      utils.asyncFilter((val, cb) => {
        cb(null, val % 2 === 0)
      }),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.eql([2, 4])
        done()
      })
    )
  })

  it('asyncFilter - async', (done) => {
    pull(
      pull.values([1, 2, 3, 4]),
      utils.asyncFilter((val, cb) => {
        setTimeout(() => {
          cb(null, val % 2 === 0)
        }, 10)
      }),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.eql([2, 4])
        done()
      })
    )
  })

  it('asyncSort', (done) => {
    pull(
      pull.values([1, 2, 3, 4]),
      utils.asyncSort((res, cb) => {
        setTimeout(() => {
          cb(null, res.reverse())
        }, 10)
      }),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.eql([4, 3, 2, 1])
        done()
      })
    )
  })

  it('asyncSort - fail', (done) => {
    pull(
      pull.values([1, 2, 3, 4]),
      utils.asyncSort((res, cb) => {
        setTimeout(() => {
          cb(new Error('fail'))
        }, 10)
      }),
      pull.collect((err, res) => {
        expect(err.message).to.be.eql('fail')
        done()
      })
    )
  })

  it('replaceStartWith', () => {
    expect(
      utils.replaceStartWith('helloworld', 'hello')
    ).to.eql(
      'world'
    )

    expect(
      utils.replaceStartWith('helloworld', 'world')
    ).to.eql(
      'helloworld'
    )
  })
})
