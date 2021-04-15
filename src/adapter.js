'use strict'

const { sortAll } = require('./utils')
const drain = require('it-drain')
const map = require('it-map')
const filter = require('it-filter')
const take = require('it-take')

/**
 * @typedef {import('./key')} Key
 * @typedef {import('./types').Pair} Pair
 * @typedef {import('./types').Datastore} Datastore
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').Query} Query
 * @typedef {import('./types').KeysQuery} KeysQuery
 * @typedef {import('./types').Batch} Batch
 */

/**
 * @template O
 * @typedef {import('./types').AwaitIterable<O>} AwaitIterable
 */

/**
 * @implements {Datastore}
 */
class Adapter {
  /**
   * @returns {Promise<void>}
   */
  open () {
    return Promise.reject(new Error('.open is not implemented'))
  }

  /**
   * @returns {Promise<void>}
   */
  close () {
    return Promise.reject(new Error('.close is not implemented'))
  }

  /**
   * @param {Key} key
   * @param {Uint8Array} val
   * @param {Options} [options]
   * @returns {Promise<void>}
   */
  put (key, val, options) {
    return Promise.reject(new Error('.put is not implemented'))
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   * @returns {Promise<Uint8Array>}
   */
  get (key, options) {
    return Promise.reject(new Error('.get is not implemented'))
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   * @returns {Promise<boolean>}
   */
  has (key, options) {
    return Promise.reject(new Error('.has is not implemented'))
  }

  /**
   * @param {Key} key
   * @param {Options} [options]
   * @returns {Promise<void>}
   */
  delete (key, options) {
    return Promise.reject(new Error('.delete is not implemented'))
  }

  /**
   * @param {AwaitIterable<Pair>} source
   * @param {Options} [options]
   * @returns {AsyncIterable<Pair>}
   */
  async * putMany (source, options = {}) {
    for await (const { key, value } of source) {
      await this.put(key, value, options)
      yield { key, value }
    }
  }

  /**
   * @param {AwaitIterable<Key>} source
   * @param {Options} [options]
   * @returns {AsyncIterable<Uint8Array>}
   */
  async * getMany (source, options = {}) {
    for await (const key of source) {
      yield this.get(key, options)
    }
  }

  /**
   * @param {AwaitIterable<Key>} source
   * @param {Options} [options]
   * @returns {AsyncIterable<Key>}
   */
  async * deleteMany (source, options = {}) {
    for await (const key of source) {
      await this.delete(key, options)
      yield key
    }
  }

  /**
   * @returns {Batch}
   */
  batch () {
    /** @type {Pair[]} */
    let puts = []
    /** @type {Key[]} */
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
   * @param {Query} q
   * @param {Options} [options]
   * @returns {AsyncIterable<Pair>}
   */
  // eslint-disable-next-line require-yield
  async * _all (q, options) {
    throw new Error('._all is not implemented')
  }

  /**
   * @param {Query} q
   * @param {Options} [options]
   */
  query (q, options) {
    let it = this._all(q, options)

    if (q.prefix != null) {
      it = filter(it, (e) =>
        e.key.toString().startsWith(/** @type {string} */ (q.prefix))
      )
    }

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }

    if (q.offset != null) {
      let i = 0
      it = filter(it, () => i++ >= /** @type {number} */ (q.offset))
    }

    if (q.limit != null) {
      it = take(it, q.limit)
    }

    return it
  }

  /**
   * @param {KeysQuery} q
   * @param {Options} [options]
   */
  queryKeys (q, options) {
    /** @type {Query} */
    const query = {
      ...q,
      filters: [],
      orders: []
    }

    // override filters to just deal with keys
    if (Array.isArray(q.filters)) {
      query.filters = q.filters.map(filter => {
        return (item) => filter(item.key)
      })
    }

    // override orders to just deal with keys
    if (Array.isArray(q.orders)) {
      query.orders = q.orders.map(order => {
        return (a, b) => order(a.key, b.key)
      })
    }

    return map(this.query(query, options), ({ key }) => key)
  }
}

module.exports = Adapter
