import type Key from './key'

export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>
export type Await<T> = Promise<T> | T
export interface Pair<K = Key, V = Uint8Array> {
  key: K
  value: V
}
/**
 * Options for async operations.
 */
export interface Options {
  signal?: AbortSignal
}

export interface Batch<K = Key, V = Uint8Array> {
  put: (key: K, value: V) => void
  delete: (key: K) => void
  commit: (options?: Options) => Promise<void>
}
export interface Datastore<K = Key, V = Uint8Array> {
  open: () => Promise<void>
  close: () => Promise<void>

  /**
   * Store the passed value under the passed key
   *
   * @example
   *
   * ```js
   * await store.put([{ key: new Key('awesome'), value: new Uint8Array([0, 1, 2, 3]) }])
   * ```
   */
  put: (key: K, val: V, options?: Options) => Promise<void>

  /**
   * Retrieve the value stored under the given key
   *
   * @example
   * ```js
   * const value = await store.get(new Key('awesome'))
   * console.log('got content: %s', value.toString('utf8'))
   * // => got content: datastore
   * ```
   */
  get: (key: K, options?: Options) => Promise<V>

  /**
   * Check for the existence of a value for the passed key
   *
   * @example
   * ```js
   *const exists = await store.has(new Key('awesome'))
   *
   *if (exists) {
   *  console.log('it is there')
   *} else {
   *  console.log('it is not there')
   *}
   *```
   */
  has: (key: K, options?: Options) => Promise<boolean>

  /**
   * Remove the record for the passed key
   *
   * @example
   *
   * ```js
   * await store.delete(new Key('awesome'))
   * console.log('deleted awesome content :(')
   * ```
   */
  delete: (key: K, options?: Options) => Promise<void>

  /**
   * Store the given key/value pairs
   *
   * @example
   * ```js
   * const source = [{ key: new Key('awesome'), value: new Uint8Array([0, 1, 2, 3]) }]
   *
   * for await (const { key, value } of store.putMany(source)) {
   *   console.info(`put content for key ${key}`)
   * }
   * ```
   */
  putMany: (
    source: AwaitIterable<Pair<K, V>>,
    options?: Options
  ) => AsyncIterable<Pair<K, V>>

  /**
   * Retrieve values for the passed keys
   *
   * @example
   * ```js
   * for await (const value of store.getMany([new Key('awesome')])) {
   *   console.log('got content:', new TextDecoder('utf8').decode(value))
   *   // => got content: datastore
   * }
   * ```
   */
  getMany: (
    source: AwaitIterable<K>,
    options?: Options
  ) => AsyncIterable<V>

  /**
   * Remove values for the passed keys
   *
   * @example
   *
   * ```js
   * const source = [new Key('awesome')]
   *
   * for await (const key of store.deleteMany(source)) {
   *   console.log(`deleted content with key ${key}`)
   * }
   * ```
   */
  deleteMany: (
    source: AwaitIterable<K>,
    options?: Options
  ) => AsyncIterable<K>

  /**
   * This will return an object with which you can chain multiple operations together, with them only being executed on calling `commit`.
   *
   * @example
   * ```js
   * const b = store.batch()
   *
   * for (let i = 0; i < 100; i++) {
   *   b.put(new Key(`hello${i}`), new TextEncoder('utf8').encode(`hello world ${i}`))
   * }
   *
   * await b.commit()
   * console.log('put 100 values')
   * ```
   */
  batch: () => Batch<K, V>

  /**
   * Query the store.
   *
   * @example
   * ```js
   * // retrieve __all__ key/value pairs from the store
   * let list = []
   * for await (const { key, value } of store.query({})) {
   *   list.push(value)
   * }
   * console.log('ALL THE VALUES', list)
   * ```
   */
   query: (query: Query<K, V>, options?: Options) => AsyncIterable<Pair<K, V>>

   /**
   * Query the store.
   *
   * @example
   * ```js
   * // retrieve __all__ keys from the store
   * let list = []
   * for await (const key of store.queryKeys({})) {
   *   list.push(key)
   * }
   * console.log('ALL THE KEYS', key)
   * ```
   */
   queryKeys: (query: KeyQuery<K>, options?: Options) => AsyncIterable<K>
}

export type QueryFilter<K = Key, V = Uint8Array> = (item: Pair<K, V>) => boolean
export type QueryOrder<K = Key, V = Uint8Array> = (a: Pair<K, V>, b: Pair<K, V>) => -1 | 0 | 1

export interface Query<K = Key, V = Uint8Array> {
  prefix?: string
  filters?: QueryFilter<K, V>[]
  orders?: QueryOrder<K, V>[]
  limit?: number
  offset?: number
}

export type KeyQueryFilter<K = Key> = (item: K) => boolean
export type KeyQueryOrder<K = Key> = (a: K, b: K) => -1 | 0 | 1

export interface KeyQuery<K = Key> {
  prefix?: string
  filters?: KeyQueryFilter<K>[]
  orders?: KeyQueryOrder<K>[]
  limit?: number
  offset?: number
}
