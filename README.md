# node-datastore interface

datastore is a generic layer of abstraction for data store and database access. It is a simple API with the aim to enable application development in a datastore-agnostic way, allowing datastores to be swapped seamlessly without changing application code. Thus, one can leverage different datastores with different strengths without committing the application to one datastore throughout its lifetime.

In addition, grouped datastores significantly simplify interesting data access patterns (such as caching and sharding).

Based on [datastore.py](https://github.com/jbenet/datastore).

Note: this is similar to [rvagg/abstract-leveldown](https://github.com/rvagg/abstract-leveldown/). Though I wrote [my original datastore](https://github.com/jbenet/datastore) many years ago. :)

## Example

See [try.js](try.js)

```js
var memDS = require('datastore.abstract/memds')
ds.put('foo', 'bar', function(err, val, key) {
  if (err) throw err
  console.log('put ' + key + ': ' + val)
  assert(val === 'bar')
})

ds.has('foo', function(err, has, key) {
  if (err) throw err
  console.log(key + ' exists? ' + has)
  assert(has === true)
})

ds.get('foo', function(err, val, key) {
  if (err) throw err
  console.log('get ' + key + ': ' + val)
  assert(val === 'bar')
})

ds.delete('foo', function(err, key) {
  if (err) throw err
  console.log(key + ' deleted')
})

ds.has('foo', function(err, has, key) {
  if (err) throw err
  console.log(key + ' exists? ' + has)
  assert(has === false)
})
```

## License

MIT
