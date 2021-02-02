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
 * @property {(key: Key, val: Uint8Array, options?: Options) => Promise<void>} put - Store the passed value under the passed key
 * @property {(key: Key, options?: Options) => Promise<Uint8Array>} get - Retrieve the value stored under the given key
 * @property {(key: Key, options?: Options) => Promise<boolean>} has - Check for the existence of a value for the passed key
 * @property {(key: Key, options?: Options) => Promise<void>} delete - Remove the record for the passed key
 * @property {(source: AwaitIterable<Pair>, options?: Options) => AsyncIterable<Pair>} putMany - Store the given key/value pairs
 * @property {(source: AwaitIterable<Key>, options?: Options) => AsyncIterable<Uint8Array>} getMany - Retrieve values for the passed keys
 * @property {(source: AwaitIterable<Key>, options?: Options) => AsyncIterable<Key>} deleteMany - Remove values for the passed keys
 * @property {() => Batch} batch - This will return an object with which you can chain multiple operations together, with them only being executed on calling `commit`
 * @property {(q: Query, options?: Options) => AsyncIterable<Pair>} query - Query the store
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
