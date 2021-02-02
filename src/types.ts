export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>;
export type Await<T> = Promise<T> | T;
export interface Pair {
  key: Key;
  value: Uint8Array;
}
/**
 * Options for async operations.
 */
export interface Options {
  signal?: AbortSignal;
}

export interface Batch {
  put: (key: Key, value: Uint8Array) => void;
  delete: (key: Key) => void;
  commit: (options?: Options) => Promise<void>;
}

interface Key {
  /**
   * Convert to the string representation
   * @returns {string}
   */
  toString(encoding: "utf8" | "utf-8" | string): string;
  /**
   * Return the Uint8Array representation of the key
   */
  uint8Array(): Uint8Array;
  /**
   * Return string representation of the key
   */
  [Symbol.toStringTag]: string;
  /**
   * Cleanup the current key
   */
  clean(): void;
  /**
   * Check if the given key is sorted lower than ourself.
   */
  less(key: Key): boolean;
  /**
   * Returns the key with all parts in reversed order.
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * // => Key('/Actor:JohnCleese/MontyPython/Comedy')
   * ```
   */
  reverse(): Key;
  /**
   * Returns the `namespaces` making up this Key.
   */
  namespaces(): string[];

  /** Returns the "base" namespace of this key.
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').baseNamespace()
   * // => 'Actor:JohnCleese'
   * ```
   */
  baseNamespace(): string;
  /**
   * Returns the `list` representation of this key.
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').list()
   * // => ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   * ```
   */
  list(): string[];

  /**
   * Returns the "type" of this key (value of last namespace).
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').type()
   * // => 'Actor'
   * ```
   */
  type(): string;
  /**
   * Returns the "name" of this key (field of last namespace).
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').name()
   * // => 'JohnCleese'
   * ```
   */
  name(): string;
  /**
   * Returns an "instance" of this type key (appends value to namespace).
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor').instance('JohnClesse')
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  instance(s: string): Key;
  /**
   * Returns the "path" of this key (parent + type).
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').path()
   * // => Key('/Comedy/MontyPython/Actor')
   * ```
   */
  path(): Key;
  /**
   * Returns the `parent` Key of this Key.
   * @example
   * ```js
   * new Key("/Comedy/MontyPython/Actor:JohnCleese").parent()
   * // => Key("/Comedy/MontyPython")
   * ```
   */
  parent(): Key;
  /**
   * Returns the `child` Key of this Key.
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').child(new Key('Actor:JohnCleese'))
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  child(key: Key): Key;
  /**
   * Returns whether this key is a prefix of `other`
   * @example
   * ```js
   * new Key('/Comedy').isAncestorOf('/Comedy/MontyPython')
   * // => true
   * ```
   */
  isAncestorOf(other: unknown): boolean;
  /**
   * Returns whether this key is a contains another as prefix.
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').isDecendantOf('/Comedy')
   * // => true
   * ```
   */
  isDecendantOf(other: unknown): boolean;
  /**
   * Checks if this key has only one namespace.
   */
  isTopLevel(): boolean;

  /**
   * Concats one or more Keys into one new Key.
   */
  concat(...keys: Key[]): Key;
}

interface KeyConstructor {
  new (s: string | Uint8Array, clean?: boolean): Key;
  /**
   * Constructs a key out of a namespace array.
   *
   * @param {Array<string>} list - The array of namespaces
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.withNamespaces(['one', 'two'])
   * // => Key('/one/two')
   * ```
   */
  withNamespaces(list: string[]): Key;

  /**
   * Returns a randomly (uuid) generated key.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.random()
   * // => Key('/f98719ea086343f7b71f32ea9d9d521d')
   * ```
   */
  random(): Key;
  isKey(value: any): value is Key;
}

declare var Key: KeyConstructor;

export type { Key };

export interface Datastore {
  open: () => Promise<void>;
  close: () => Promise<void>;
  /**
   * Store the passed value under the passed key
   *
   * @example
   *
   * ```js
   * await store.put([{ key: new Key('awesome'), value: new Uint8Array([0, 1, 2, 3]) }])
   * ```
   */
  put: (key: Key, val: Uint8Array, options?: Options) => Promise<void>;
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
  get: (key: Key, options?: Options) => Promise<Uint8Array>;
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
  has: (key: Key, options?: Options) => Promise<boolean>;
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
  delete: (key: Key, options?: Options) => Promise<void>;
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
    source: AwaitIterable<Pair>,
    options?: Options
  ) => AsyncIterable<Pair>;
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
    source: AwaitIterable<Key>,
    options?: Options
  ) => AsyncIterable<Uint8Array>;
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
    source: AwaitIterable<Key>,
    options?: Options
  ) => AsyncIterable<Key>;
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
  batch: () => Batch;
  /**
   * Query the store.
   *
   * @example
   * ```js
   * // retrieve __all__ values from the store
   * let list = []
   * for await (const value of store.query({})) {
   *   list.push(value)
   * }
   * console.log('ALL THE VALUES', list)
   * ```
   */
  query: (q: Query, options?: Options) => AsyncIterable<Pair>;
}

export interface Query {
  prefix?: string;
  filters?: Array<(item: Pair) => boolean>;
  orders?: Array<(items: Pair[]) => Await<Pair[]>>;
  limit?: number;
  offset?: number;
  keysOnly?: boolean;
}
