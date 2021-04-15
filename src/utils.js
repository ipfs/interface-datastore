'use strict'

const tempdir = require('ipfs-utils/src/temp-dir')
const all = require('it-all')

/**
 * @template T
 * @typedef {import("./types").Await<T>} PromiseOrValue
 */

/**
 * @template T
 * @typedef {import("./types").AwaitIterable<T>} AnyIterable
 */

/**
 * Collect all values from the iterable and sort them using
 * the passed sorter function
 *
 * @template T
 * @param {AnyIterable<T>} iterable
 * @param {(a: T, b: T) => -1 | 0 | 1} sorter
 * @returns {AsyncIterable<T>}
 */
const sortAll = (iterable, sorter) => {
  return (async function * () {
    const values = await all(iterable)
    yield * values.sort(sorter)
  })()
}

/**
 * @param {string} s
 * @param {string} r
 */
const replaceStartWith = (s, r) => {
  const matcher = new RegExp('^' + r)
  return s.replace(matcher, '')
}

module.exports = {
  sortAll,
  tmpdir: tempdir,
  replaceStartWith
}
