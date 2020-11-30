'use strict'

const { filter, sortAll, take, map } = require('./utils')
const drain = require('it-drain')

/**
 * @typedef {import('./key')} Key
 * @typedef {import('./types').Pair} Pair
 * @typedef {import('./types').IDatastore} IDatastore
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').Query} Query
 * @typedef {import('./types').Batch} Batch
 */

/**
 * @template O
 * @typedef {import('./types').AnyIterable<O>} AnyIterable
 */

/**
 * @implements {IDatastore}
 */
class Adapter {
  open () {
    return Promise.resolve()
  }

  close () {
    return Promise.resolve()
  }

  /**
   * Store the passed value under the passed key
   *
   * @param {Key} key
   * @param {Uint8Array} val
   * @param {Options} options
   * @returns {Promise<void>}
   */
  put (key, val, options) { // eslint-disable-line require-await
    return Promise.resolve()
  }

  /**
   * Store the given key/value pairs
   *
   * @param {AnyIterable<Pair>} source
   * @param {Object} options
   * @returns {AsyncGenerator<Pair>}
   */
  async * putMany (source, options = {}) {
    for await (const { key, value } of source) {
      await this.put(key, value, options)
      yield { key, value }
    }
  }

  /**
   * Retrieve the value for the passed key
   *
   * @param {Key} key
   * @param {Object} options
   * @returns {Promise<Uint8Array>}
   */
  get (key, options = {}) {
    return Promise.resolve(new Uint8Array())
  }

  /**
   * @param {AnyIterable<Key>} source
   */
  async * getMany (source, options = {}) {
    for await (const key of source) {
      yield this.get(key, options)
    }
  }

  /**
   * Check for the existence of a value for the passed key
   *
   * @param {Key} key
   * @returns {Promise<boolean>}
   * @example
   * ```js
   * const exists = await store.has(new Key('awesome'))
   *
   *   if (exists) {
   *    console.log('it is there')
   * } else {
   *  console.log('it is not there')
   * }
   * ```
   */
  has (key) { // eslint-disable-line require-await
    return Promise.resolve(false)
  }

  /**
   * Remove the record for the passed key
   *
   * @param {Key} key
   * @param {Object} options
   * @returns {Promise<void>}
   */
  delete (key, options = {}) { // eslint-disable-line require-await
    return Promise.resolve()
  }

  /**
   * Remove values for the passed keys
   *
   * @param {AnyIterable<Key>} source
   * @param {Options} options
   * @returns {AsyncGenerator<Key>}
   */
  async * deleteMany (source, options = {}) {
    for await (const key of source) {
      await this.delete(key, options)
      yield key
    }
  }

  /**
   * Create a new batch object.
   *
   * @returns {Batch}
   */
  batch () {
    let puts = []
    let dels = []

    return {
      put (key, value) {
        puts.push({ key, value })
      },
      delete (key) {
        dels.push(key)
      },
      commit: async (options) => {
        await drain(this.putMany(puts, options))
        puts = []
        await drain(this.deleteMany(dels, options))
        dels = []
      }
    }
  }

  /**
   * Yield all datastore values
   *
   * @param {Query} q
   * @param {Options} options
   * @returns {AsyncGenerator<Pair>}
   */
  async * _all (q, options) { // eslint-disable-line require-await

  }

  /**
   * @param {Query} q
   * @param {Options} options
   * @returns {AsyncGenerator<Pair|{key: Key}>}
   */
  query (q, options) {
    let it = this._all(q, options)

    if (q.prefix != null) {
      it = filter(it, e => e.key.toString().startsWith(/** @type {string} */(q.prefix)))
    }

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }

    if (q.offset != null) {
      let i = 0
      it = filter(it, () => i++ >= /** @type {number} */(q.offset))
    }

    if (q.limit != null) {
      it = take(it, q.limit)
    }

    if (q.keysOnly === true) {
      return map(it, e => ({ key: e.key }))
    }

    return it
  }
}

module.exports = Adapter
