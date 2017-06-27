/* @flow */
'use strict'

const path = require('path')

// Fallback to `path` because `path.posix` may not be available in browsers.
module.exports = path.posix || path
