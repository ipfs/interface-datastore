'use strict'

const Key = require('./key')
const Adapter = require('./adapter')

// Errors
const Errors = require('./errors')

/**
 * @typedef {import('./types').Pair} Pair
 * @typedef {import('./types').IDatastore} IDatastore
 * @typedef {import('./types').Options} Options
 */

/**
 * @class MemoryDatastore
 * @implements {IDatastore}
 */
class MemoryDatastore extends Adapter {
  constructor () {
    super()

    this.data = {}
  }

  /**
   * @param {Key} key
   * @param {Uint8Array} val
   */
  async put (key, val) { // eslint-disable-line require-await
    this.data[key.toString()] = val
  }

  /**
   * @param {Key} key
   */
  async get (key) {
    const exists = await this.has(key)
    if (!exists) throw Errors.notFoundError()
    return this.data[key.toString()]
  }

  /**
   * @param {Key} key
   */
  async has (key) { // eslint-disable-line require-await
    return this.data[key.toString()] !== undefined
  }

  /**
   * @param {Key} key
   */
  async delete (key) { // eslint-disable-line require-await
    delete this.data[key.toString()]
  }

  async * _all () {
    yield * Object.entries(this.data)
      .map(([key, value]) => ({ key: new Key(key), value }))
  }
}

module.exports = MemoryDatastore
