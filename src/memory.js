/* @flow */
'use strict'

/* :: import type {Batch, Query, QueryResult, Callback} from './' */

const { filter, sortAll, take, map } = require('./utils')
const Key = require('./key')

// Errors
const Errors = require('./errors')

class MemoryDatastore {
  /* :: data: {[key: string]: Buffer} */

  constructor () {
    this.data = {}
  }

  async open () /* : Promise */ {}

  async put (key /* : Key */, val /* : Buffer */) /* : Promise */ {
    this.data[key.toString()] = val
  }

  async get (key /* : Key */) /* : Promise<Buffer> */ {
    const exists = await this.has(key)
    if (!exists) throw Errors.notFoundError()
    return this.data[key.toString()]
  }

  async has (key /* : Key */) /* : Promise<Boolean> */ {
    return this.data[key.toString()] !== undefined
  }

  async delete (key /* : Key */) /* : Promise */ {
    delete this.data[key.toString()]
  }

  batch () /* : Batch<Buffer> */ {
    let puts = []
    let dels = []

    return {
      put (key /* : Key */, value /* : Buffer */) /* : void */ {
        puts.push([key, value])
      },
      delete (key /* : Key */) /* : void */ {
        dels.push(key)
      },
      commit: async () /* : Promise */ => {
        puts.forEach(v => {
          this.data[v[0].toString()] = v[1]
        })
        puts = []

        dels.forEach(key => {
          delete this.data[key.toString()]
        })
        dels = []
      }
    }
  }

  query (q /* : Query<Buffer> */) /* : Iterator */ {
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

  async close () /* : Promise */ {}
}

module.exports = MemoryDatastore
