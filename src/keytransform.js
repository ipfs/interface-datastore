/* @flow */
'use strict'

/* :: import type Key from './key' */
/* :: import type {Datastore, Batch, Query, QueryResult} from './' */

const pull = require('pull-stream')

/**
 * Map one key onto another key.
 */

/**
 * An object with a pair of functions for (invertibly) transforming keys
 */
/* :: type KeyMapping = (Key) => Key */

/**
 * A datastore shim, that wraps around a given datastore, changing
 * the way keys look to the user, for example namespacing
 * keys, reversing them, etc.
 */
/* :: type KeyTransform = {
  convert: KeyMapping,
  invert: KeyMapping
} */
class KeyTransformDatastore /* :: <Value> */ {
  /* :: child: Datastore<Value> */
  /* :: transform: KeyTransform */

  constructor (child /* : Datastore<Value> */, transform /* : KeyTransform */) {
    this.child = child
    this.transform = transform
  }

  put (key /* : Key */, val /* : Value */, callback /* : (?Error) => void */) /* : void */ {
    this.child.put(this.transform.convert(key), val, callback)
  }

  get (key /* : Key */, callback /* : (?Error, ?Value) => void */) /* : void */ {
    this.child.get(this.transform.convert(key), callback)
  }

  has (key /* : Key */, callback /* : (?Error, ?bool) => void */) /* : void */ {
    this.child.has(this.transform.convert(key), callback)
  }

  delete (key /* : Key */, callback /* : (?Error) => void */) /* : void */ {
    this.child.delete(this.transform.convert(key), callback)
  }

  batch () /* : Batch<Value> */ {
    const b = this.child.batch()
    return {
      put: (key /* : Key */, value /* : Value */) /* : void */ => {
        b.put(this.transform.convert(key), value)
      },
      delete: (key /* : Key */) /* : void */ => {
        b.delete(this.transform.convert(key))
      },
      commit: (callback /* : (err: ?Error) => void */) => {
        b.commit(callback)
      }
    }
  }

  query (q /* : Query<Value> */) /* : QueryResult<Value> */ {
    return pull(this.child.query(q), pull.map(e => {
      e.key = this.transform.invert(e.key)
      return e
    }))
  }

  close (callback /* : (err: ?Error) => void */) /* : void */ {
    this.child.close(callback)
  }
}

module.exports = KeyTransformDatastore
