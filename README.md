# interface-datastore

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://flat.badgen.net/travis/ipfs/interface-datastore)](https://travis-ci.com/ipfs/interface-datastore)
[![Code Coverage](https://codecov.io/gh/ipfs/interface-datastore/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/interface-datastore)
[![Dependency Status](https://david-dm.org/ipfs/interface-datastore.svg?style=flat-square)](https://david-dm.org/ipfs/interface-datastore)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D8.0.0-orange.svg?style=flat-square)

> Implementation of the [datastore](https://github.com/ipfs/go-datastore) interface in JavaScript

## Lead Maintainer

[Alex Potsides](https://github.com/achingbrain)

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
  - Tiered: [`datstore-core/src/tiered`](https://github.com/ipfs/js-datastore-core/blob/master/src/tiered.js)
  - Namespace: [`datastore-core/src/namespace`](https://github.com/ipfs/js-datastore-core/tree/master/src/namespace.js)

If you want the same functionality as [go-ds-flatfs](https://github.com/ipfs/go-ds-flatfs), use sharding with fs.

```js
const FsStore = require('datastore-fs')
const ShardingStore = require('datastore-core').ShardingDatatstore
const NextToLast = require('datastore-core').shard.NextToLast

const fs = new FsStore('path/to/store')

// flatfs now works like go-flatfs
const flatfs = await ShardingStore.createOrOpen(fs, new NextToLast(2))
```

## Install

```sh
$ npm install interface-datastore
```

The type definitions for this package are available on http://definitelytyped.org/. To install just use:

```sh
$ npm install -D @types/interface-datastore
```

## Usage

### Wrapping Stores

```js
const MemoryStore = require('interface-datastore').MemoryDatastore
const MountStore = require('datastore-core').MountDatastore
const Key = require('interface-datastore').Key

const store = new MountStore({ prefix: new Key('/a'), datastore: new MemoryStore() })
```

### Test suite

Available under [`src/tests.js`](src/tests.js)

```js
describe('mystore', () => {
  require('interface-datastore/src/tests')({
    async setup () {
      return instanceOfMyStore
    },
    async teardown () {
      // cleanup resources
    }
  })
})
```

## API

### Keys

To allow a better abstraction on how to address values, there is a `Key` class which is used as identifier. It's easy to create a key from a `Buffer` or a `string`.

```js
const a = new Key('a')
const b = new Key(new Buffer('hello'))
```

The key scheme is inspired by file systems and Google App Engine key model. Keys are meant to be unique across a system. They are typically hierarchical, incorporating more and more specific namespaces. Thus keys can be deemed 'children' or 'ancestors' of other keys:

- `new Key('/Comedy')`
- `new Key('/Comedy/MontyPython')`

Also, every namespace can be parameterized to embed relevant object information. For example, the Key `name` (most specific namespace) could include the object type:

- `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
- `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`


### Methods

> The exact types can be found in [`src/index.js`](src/index.js).

These methods will be present on every datastore. `Key` always means an instance of the above mentioned Key type. Every datastore is generic over the `Value` type, though currently all backing implementations are implemented only for [`Buffer`](https://nodejs.org/docs/latest/api/buffer.html).

### `has(key)` -> `Promise<Boolean>`

- `key: Key`

Check for the existence of a given key

```js
const exists = await store.has(new Key('awesome'))
console.log('is it there', exists)
```

### `put(key, value)` -> `Promise`

- `key: Key`
- `value: Value`

Store a value with the given key.

```js
await store.put(new Key('awesome'), new Buffer('datastores'))
console.log('put content')
```

### `get(key)` -> `Promise<Value>`

- `key: Key`

Retrieve the value stored under the given key.

```js
const value = await store.get(new Key('awesome'))
console.log('got content: %s', value.toString())
// => got content: datastore
```

### `delete(key)` -> `Promise`

- `key: Key`

Delete the content stored under the given key.

```js
await store.delete(new Key('awesome'))
console.log('deleted awesome content :(')
```

### `query(query)` -> `Iterable`

- `query: Query` see below for possible values

Search the store for some values. Returns an [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) with each item being a `Value`.

```js
// retrieve __all__ values from the store
let list = []
for await (const value of store.query({})) {
  list.push(value)
}
console.log('ALL THE VALUES', list)
```

#### `Query`

Object in the form with the following optional properties

- `prefix: string` (optional) - only return values where the key starts with this prefix
- `filters: Array<Filter<Value>>` (optional) - filter the results according to the these functions
- `orders: Array<Order<Value>>` (optional) - order the results according to these functions
- `limit: Number` (optional) - only return this many records
- `offset: Number` (optional) - skip this many records at the beginning
- `keysOnly: Boolean` (optional) - Only return keys, no values.

### `batch()`

This will return an object with which you can chain multiple operations together, with them only being executed on calling `commit`.

```js
const b = store.batch()

for (let i = 0; i < 100; i++) {
  b.put(new Key(`hello${i}`), new Buffer(`hello world ${i}`))
}

await b.commit()
console.log('put 100 values')
```

#### `put(key, value)`

- `key: Key`
- `value: Value`

Queue a put operation to the store.

#### `delete(key)`

- `key: Key`

Queue a delete operation to the store.

#### `commit()` -> `Promise`

Write all queued operations to the underyling store. The batch object should not be used after calling this.

### `open()` -> `Promise`

Opens the datastore, this is only needed if the store was closed before, otherwise this is taken care of by the constructor.

### `close()` -> `Promise`

Close the datastore, this should always be called to ensure resources are cleaned up.

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT 2017 © IPFS
