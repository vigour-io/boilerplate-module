'use strict'
const test = require('tape')

module.exports = function () {
  test('hello world', { timeout: 5e3 }, (t) => {
    t.end()
  })
}
