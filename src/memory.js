'use strict'

const { filter, sortAll, take, map } = require('./utils')
const Key = require('./key')

// Errors
const Errors = require('./errors')

function throwIfAborted (signal) {
  if (signal && signal.aborted) {
    throw Error.abortedError()
  }
}

class MemoryDatastore {
  constructor () {
    this.data = {}
  }

  async open () {}

  async put (key, val) { // eslint-disable-line require-await
    this.data[key.toString()] = val
  }

  async * putMany (source, options = {}) {
    throwIfAborted(options.signal)

    for await (const { key, value } of source) {
      throwIfAborted(options.signal)
      await this.put(key, value)
      yield { key, value }
    }
  }

  async get (key) {
    const exists = await this.has(key)
    if (!exists) throw Errors.notFoundError()
    return this.data[key.toString()]
  }

  async * getMany (source, options = {}) {
    throwIfAborted(options.signal)

    for await (const key of source) {
      throwIfAborted(options.signal)
      yield this.get(key)
    }
  }

  async has (key) { // eslint-disable-line require-await
    return this.data[key.toString()] !== undefined
  }

  async delete (key) { // eslint-disable-line require-await
    delete this.data[key.toString()]
  }

  async * deleteMany (source, options = {}) {
    throwIfAborted(options.signal)

    for await (const key of source) {
      throwIfAborted(options.signal)
      await this.delete(key)
      yield key
    }
  }

  batch () {
    let puts = []
    let dels = []

    const self = this

    return {
      put (key, value) {
        puts.push({ key, value })
      },
      delete (key) {
        dels.push(key)
      },
      async * commit (options) { // eslint-disable-line require-await
        yield * self.putMany(puts, options)
        puts = []
        yield * self.deleteMany(dels, options)
        dels = []
      }
    }
  }

  query (q) {
    let it = Object.entries(this.data)

    it = map(it, entry => ({ key: new Key(entry[0]), value: entry[1] }))

    if (q.prefix != null) {
      it = filter(it, e => e.key.toString().startsWith(q.prefix))
    }

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }

    if (q.offset != null) {
      let i = 0
      it = filter(it, () => i++ >= q.offset)
    }

    if (q.limit != null) {
      it = take(it, q.limit)
    }

    if (q.keysOnly === true) {
      it = map(it, e => ({ key: e.key }))
    }

    return it
  }

  async close () {}
}

module.exports = MemoryDatastore
