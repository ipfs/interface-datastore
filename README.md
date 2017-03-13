# interface-datastore

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/interface-datastore.svg)](https://travis-ci.org/ipfs/interface-datastore) [![Circle CI](https://circleci.com/gh/ipfs/interface-datastore.svg?style=svg)](https://circleci.com/gh/ipfs/interface-datastore)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/interface-datastore/badge.svg?branch=master)](https://coveralls.io/github/ipfs/interface-datastore?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/interface-datastore)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> Implementation of the [datastore](https://github.com/ipfs/go-datastore) interface in JavaScript


## Table of Contents

- [Implementations](#implementations)
- [Install](#install)
- [Usage](#usage)
- [Api](#api)
- [Contribute](#contribute)
- [License](#license)

## Implementations

- Backed Implementations
  - Memory: [`src/memory`](src/memory.js)
  - level: [`datastore-level`](https://github.com/ipfs/js-datastore-level) (supports any levelup compatible backend)
  - File System: [`datstore-fs`](https://github.com/ipfs/js-datastore-fs)
- Wrapper Implementations
  - Mount: [`datastore-core/src/mount`](https://github.com/ipfs/js-datastore-core/tree/master/src/mount.js)
  - Keytransform: [`datstore-core/src/keytransform`](https://github.com/ipfs/js-datastore-core/tree/master/src/keytransform.js)
  - Sharding: [`datastore-core/src/sharding`](https://github.com/ipfs/js-datastore-core/tree/master/src/sharding.js)
  - Tiered: [`datstore-core/src/tiered`](https://github.com/ipfs/js-datastore-core/tree/master/src/tirered.js)
  - Namespace: [`datastore-core/src/namespace`](https://github.com/ipfs/js-datastore-core/tree/master/src/namespace.js)

If you want the same functionality as [go-ds-flatfs](https://github.com/ipfs/go-ds-flatfs), use sharding with fs.

```js
const FsStore = require('datastore-fs)
const ShardingStore = require('datastore-core').ShardingDatatstore
const NextToLast = require('datastore-core').shard.NextToLast

const fs = new FsStore('path/to/store')
ShardingStore.createOrOpen(fs, new NextToLast(2), (err, flatfs) => {
  // flatfs now works like go-flatfs
})
```

## Install

```
$ npm install interface-datastore
```

## Usage

### Wrapping Stores

```js
const MemoryStore = require('interface-datastore').MemoryDatastore
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key

const store = new MountStore({prefix: new Key('/a'), datastore: new MemoryStore()})
```

### Testsuite

Available under [`src/tests.js`](src/tests.js)

```js
describe('mystore', () => {
  require('interface-datastore/src/tests)({
    setup (callback) {
      callback(null, instanceOfMyStore)
    },
    teardown (callback) {
      // cleanup resources
      callback()
    }
  })
})
```

## API

The exact types can be found in [`src/index.js`](src/index.js).

### `put(Key, Value, (err: ?Error) => void): void`

### `get(Key, (err: ?Error, val: ?Value) => void): void`

### `delete(Key, (err: ?Error) => void): void`

### `query(Query<Value>): QueryResult<Value>)`

#### `Query`

Object in the form with the following optional properties

- `prefix?: string`
- `filters?: Array<Filter<Value>>`
- `orders?: Array<Order<Value>>`
- `limit?: number`
- `offset?: number`
- `keysOnly?: bool`

### batch(): Batch<Value>

#### `put(Key, Value): void`
#### `delete(Key): void`
#### `commit((err: ?Error) => void): void`

### `close((err: ?Error) => void): void`

Close the datastore, this should always be called to ensure resources are cleaned up.

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS
