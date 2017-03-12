# interface-datastore

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-interface-datastore.svg)](https://travis-ci.org/ipfs/js-interface-datastore) [![Circle CI](https://circleci.com/gh/ipfs/js-interface-datastore.svg?style=svg)](https://circleci.com/gh/ipfs/js-interface-datastore)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-interface-datastore/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-interface-datastore?branch=master) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/ipfs/js-interface-datastore)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> Implementation of the datastore interface in JavaScript

## Implementations

- Backed Implementations
  - Memory: [`src/memory`](src/memory.js)
  - leveldb: [`datastore-leveldb`](https://github.com/ipfs/js-datastore-leveldb) (supports any levelup compatible backend)
  - File System: [`datstore-fs`](https://github.com/ipfs/js-datastore-fs)
- Wrapper Implementations
  - Mount: [`src/mount`](src/mount.js)
  - Keytransform: [`src/keytransform`](src/keytransform.js)
  - Sharding: [`src/sharding`](src/sharding.js)
  - Tiered: [`src/tiered`](src/tirered.js)

If you want the same functionality as [go-ds-flatfs](https://github.com/ipfs/go-ds-flatfs), use sharding with fs.

```js
const FsStore = require('datastore-fs)
const ShardingStore = require('interface-datastore).ShardingDatatstore
const NextToLast = require('interface-datastore).shard.NextToLast

const fs = new FsStore('path/to/store')
ShardingStore.createOrOpen(fs, new NextToLast(2), (err, flatfs) => {
  // flatfs now works like go-flatfs
})
```

## Testsuite

Available under `test/interface`

```js
describe('mystore', () => {
  require('interface-datastore/test/interface')({
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

## License

MIT 2017 @ IPFS
