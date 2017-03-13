/* @flow */
'use strict'

const Key = require('./key')
const KeytransformDatastore = require('./keytransform')
const MemoryDatastore = require('./memory')
const ShardingDatastore = require('./sharding')
const MountDatastore = require('./mount')
const TieredDatastore = require('./tiered')
const NamespaceDatastore = require('./namespace')
const shard = require('./shard')
const utils = require('./utils')

exports.Key = Key
exports.KeytransformDatastore = KeytransformDatastore
exports.MemoryDatastore = MemoryDatastore
exports.ShardingDatastore = ShardingDatastore
exports.MountDatastore = MountDatastore
exports.TieredDatastore = TieredDatastore
exports.NamespaceDatastore = NamespaceDatastore
exports.shard = shard
exports.utils = utils

/* ::
// -- Basics

export type Callback<Value> = (err: ?Error, ?Value) => void

// eslint-disable-next-line
export interface Datastore<Value> {
  // eslint-disable-next-line
  put(Key, Value, Callback<void>): void;
  // eslint-disable-next-line
  get(Key, Callback<Value>): void;
  has(Key, Callback<bool>): void;
  delete(Key, Callback<void>): void;
  // eslint-disable-next-line
  query(Query<Value>): QueryResult<Value>;

  // eslint-disable-next-line
  batch(): Batch<Value>;
  close(Callback<void>): void;
}

// -- Batch
export type Batch<Value> = {
  put(Key, Value): void,
  delete(Key): void,
  commit(Callback<void>): void
}

// -- Query

export type Query<Value> = {
  prefix?: string,
  filters?: Array<Filter<Value>>,
  orders?: Array<Order<Value>>,
  limit?: number,
  offset?: number,
  keysOnly?: bool
}

export type PullEnd = bool | Error
export type PullSource<Val> = (end: ?PullEnd, (end: ?PullEnd, Val) => void) => void

export type QueryResult<Value> = PullSource<QueryEntry<Value>>

export type QueryEntry<Value> = {
  key: Key,
  value?: Value
}

export type Filter<Value> = (QueryEntry<Value>, Callback<bool>) => void

export type Order<Value> = (QueryResult<Value>, Callback<QueryResult<Value>>) => void

*/
