/* @flow */
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect

const shard = require('../src').shard

describe('shard', () => {
  it('prefix', () => {
    expect(
      new shard.Prefix(2).fun('hello')
    ).to.eql(
      'he'
    )
    expect(
      new shard.Prefix(2).fun('h')
    ).to.eql(
      'h_'
    )

    expect(
      new shard.Prefix(2).toString()
    ).to.eql(
      '/repo/flatfs/shard/v1/prefix/2'
    )
  })

  it('suffix', () => {
    expect(
      new shard.Suffix(2).fun('hello')
    ).to.eql(
      'lo'
    )
    expect(
      new shard.Suffix(2).fun('h')
    ).to.eql(
      '_h'
    )

    expect(
      new shard.Suffix(2).toString()
    ).to.eql(
      '/repo/flatfs/shard/v1/suffix/2'
    )
  })

  it('next-to-last', () => {
    expect(
      new shard.NextToLast(2).fun('hello')
    ).to.eql(
      'll'
    )
    expect(
      new shard.NextToLast(3).fun('he')
    ).to.eql(
      '__h'
    )

    expect(
      new shard.NextToLast(2).toString()
    ).to.eql(
      '/repo/flatfs/shard/v1/next-to-last/2'
    )
  })

  describe('parsesShardFun', () => {
    it('errors', () => {
      const errors = [
        '',
        'shard/v1/next-to-last/2',
        '/repo/flatfs/shard/v2/next-to-last/2',
        '/repo/flatfs/shard/v1/other/2',
        '/repo/flatfs/shard/v1/next-to-last/'
      ]

      errors.forEach((input) => {
        expect(
          () => shard.parseShardFun(input)
        ).to.throw()
      })
    })

    it('success', () => {
      const success = [
        'prefix',
        'suffix',
        'next-to-last'
      ]

      success.forEach((name) => {
        const n = Math.floor(Math.random() * 100)
        expect(
          shard.parseShardFun(
            `/repo/flatfs/shard/v1/${name}/${n}`
          ).name
        ).to.eql(name)
      })
    })
  })
})
