'use strict'

/**
 * @template T
 * @typedef {Iterable<T> | AsyncIterable<T>} AwaitIterable<T>
 */

/**
 * @template T
 * @typedef {Promise<T> | T} Await<T>
 */

/**
 * @typedef {object} Pair
 * @property {Key} key
 * @property {Uint8Array} value
 *
 * @typedef {object} Options
 * @property {import('abort-controller').AbortSignal} [signal]
 *
 * @typedef {object} Batch
 * @property {(key: Key, value: Uint8Array) => void} put
 * @property {(key: Key) => void} delete
 * @property {(options?: Options) => Promise<void>} commit
 *
 * @typedef {object} Query
 * @property {string} [prefix]
 * @property {(item: Pair) => boolean} [filters]
 * @property {(items: Pair[]) => Await<Pair[]>} [orders]
 * @property {number} [limit]
 * @property {number} [offset]
 * @property {boolean} [keysOnly]
 *
 * @typedef {object} Datastore
 * @property {() => Promise<void>} open
 * @property {() => Promise<void>} close
 * @property {(key: Key, val: Uint8Array, options?: Options) => Promise<void>} put
 * @property {(key: Key, options?: Options) => Promise<Uint8Array>} get
 * @property {(key: Key, options?: Options) => Promise<boolean>} has
 * @property {(key: Key, options?: Options) => Promise<void>} delete
 * @property {(source: AwaitIterable<Pair>, options?: Options) => AsyncIterable<Pair>} putMany
 * @property {(source: AwaitIterable<Key>, options?: Options) => AsyncIterable<Uint8Array>} getMany
 * @property {(source: AwaitIterable<Key>, options?: Options) => AsyncIterable<Key>} deleteMany
 * @property {() => Batch} batch
 * @property {(q: Query, options?: Options) => AsyncIterable<Pair>} query
 */

const Key = require('./key')
const MemoryDatastore = require('./memory')
const utils = require('./utils')
const Errors = require('./errors')
const Adapter = require('./adapter')

module.exports = {
  Key,
  MemoryDatastore,
  utils,
  Errors,
  Adapter
}
