/* @flow */
'use strict'

const path = require('path')
const uuid = require('uuid/v4')

/**
 * A Key represents the unique identifier of an object.
 * Our Key scheme is inspired by file systems and Google App Engine key model.
 * Keys are meant to be unique across a system. Keys are hierarchical,
 * incorporating more and more specific namespaces. Thus keys can be deemed
 * 'children' or 'ancestors' of other keys:
 * - `new Key('/Comedy')`
 * - `new Key('/Comedy/MontyPython')`
 * Also, every namespace can be parametrized to embed relevant object
 * information. For example, the Key `name` (most specific namespace) could
 * include the object type:
 * - `new Key('/Comedy/MontyPython/Actor:JohnCleese')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop')`
 * - `new Key('/Comedy/MontyPython/Sketch:CheeseShop/Character:Mousebender')`
 *
 */
class Key {
  /* :: _string: string */

  constructor (s /* : string */, clean /* : ?bool */) {
    this._string = s
    if (clean == null) {
      clean = true
    }

    if (clean) {
      this.clean()
    }

    if (this._string.length === 0 || !this._string.startsWith('/')) {
      throw new Error(`Invalid key: ${this.toString()}`)
    }
  }

  toString () {
    return this._string
  }

  // waiting on https://github.com/facebook/flow/issues/2286
  // $FlowFixMe
  get [Symbol.toStringTag] () /* : string */ {
    return `[Key ${this._string}]`
  }

  /**
   * Constructs a key out of a namespace array.
   *
   * @example
   * Key.withNamespaces(['one', 'two'])
   * // => Key('/one/two')
   *
   */
  static withNamespaces (list /* : Array<string> */) /* : Key */ {
    return new Key(list.join('/'))
  }

  /**
   * Returns a randomly (uuid) generated key.
   *
   * @example
   * Key.random()
   * // => Key('/f98719ea086343f7b71f32ea9d9d521d')
   *
   */
  static random () /* : Key */ {
    return new Key(uuid().replace(/-/g, ''))
  }

  /**
   * Cleanup the current key
   */
  clean () {
    if (!this._string) {
      this._string = '/'
    }

    if (!this._string.startsWith('/')) {
      this._string = '/' + this._string
    }

    this._string = path.normalize(this._string)

    // normalize does not removeve trailing slashes
    if (this._string.length > 1) {
      this._string = this._string.replace(/\/$/, '')
    }
  }

  /**
   * Check if the given key is sorted lower than ourself.
   */
  less (key /* : Key */) /* : bool */ {
    const list1 = this.list()
    const list2 = key.list()

    for (let i = 0; i < list1.length; i++) {
      if (list2.length < i + 1) {
        return false
      }

      const c1 = list1[i]
      const c2 = list2[i]

      if (c1 < c2) {
        return true
      } else if (c1 > c2) {
        return false
      }
    }

    return list1.length < list2.length
  }

  /**
   * Returns the key with all parts in reversed order.
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * // => Key('/Actor:JohnCleese/MontyPython/Comedy')
   */
  reverse () /* : Key */ {
    return Key.withNamespaces(this.list().slice().reverse())
  }

  /**
   * Returns the `namespaces` making up this Key.
   */
  namespaces () /* : Array<string> */ {
    return this.list()
  }

  /** Returns the "base" namespace of this key.
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').baseNamespace()
   * // => 'Actor:JohnCleese'
   *
   */
  baseNamespace () /* : string */ {
    const ns = this.namespaces()
    return ns[ns.length - 1]
  }

  /**
   * Returns the `list` representation of this key.
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').list()
   * // => ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   *
   */
  list () /* : Array<string> */ {
    return this._string.split('/').slice(1)
  }

  /**
   * Returns the "type" of this key (value of last namespace).
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').type()
   * // => 'Actor'
   *
   */
  type () /* : string */ {
    return namespaceType(this.baseNamespace())
  }
  /**
   * Returns the "name" of this key (field of last namespace).
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').name()
   * // => 'JohnCleese'
   */
  name () /* : string */ {
    return namespaceValue(this.baseNamespace())
  }

  /**
   * Returns an "instance" of this type key (appends value to namespace).
   * new Key('/Comedy/MontyPython/Actor').instance('JohnClesse')
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   */
  instance (s /* : string */) /* : Key */ {
    return new Key(this._string + ':' + s)
  }

  /**
   * Returns the "path" of this key (parent + type).
   *
   * @example
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').path()
   * // => Key('/Comedy/MontyPython/Actor')
   *
   */
  path () /* : Key */ {
    return new Key(this.parent().toString() + '/' + this.type())
  }

  /**
   * Returns the `parent` Key of this Key.
   *
   * @example
   * new Key("/Comedy/MontyPython/Actor:JohnCleese").parent()
   * // => Key("/Comedy/MontyPython")
   *
   */
  parent () /* : Key */ {
    const list = this.list()
    if (list.length === 1) {
      return new Key('/', false)
    }

    return new Key(list.slice(0, -1).join('/'))
  }

  /**
   * Returns the `child` Key of this Key.
   *
   * @example
   * new Key('/Comedy/MontyPython').child(new Key('Actor:JohnCleese'))
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   *
   */
  child (key /* : Key */) /* : Key */ {
    if (this.toString() === '/') {
      return key
    } else if (key.toString() === '/') {
      return this
    }

    return new Key(this.toString() + key.toString(), false)
  }

  /**
   * Returns whether this key is a prefix of `other`
   *
   * @example
   * new Key('/Comedy').isAncestorOf('/Comedy/MontyPython')
   * // => true
   *
   */
  isAncestorOf (other /* : Key */) /* : bool */ {
    if (other.toString() === this.toString()) {
      return false
    }

    return other.toString().startsWith(this.toString())
  }

  /**
   * Returns whether this key is a contains another as prefix.
   *
   * @example
   * new Key('/Comedy/MontyPython').isDecendantOf('/Comedy')
   * // => true
   *
   */
  isDecendantOf (other /* : Key */) /* : bool */ {
    if (other.toString() === this.toString()) {
      return false
    }

    return this.toString().startsWith(other.toString())
  }

  /**
   * Returns wether this key has only one namespace.
   */
  isTopLevel () /* : bool */ {
    return this.list().length === 1
  }
}

/**
 * The first component of a namespace. `foo` in `foo:bar`
 */
function namespaceType (ns /* : string */) /* : string */ {
  const parts = ns.split(':')
  if (parts.length < 2) {
    return ''
  }
  return parts.slice(0, -1).join(':')
}

/**
 * The last component of a namespace, `baz` in `foo:bar:baz`.
 */
function namespaceValue (ns /* : string */) /* : string */ {
  const parts = ns.split(':')
  return parts[parts.length - 1]
}

module.exports = Key
