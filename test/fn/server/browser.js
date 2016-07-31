'use strict'
const test = require('tape')

module.exports = function () {
  test('server', (t) => {
    t.ok(true, 'no http server in the browser')
    t.end()
  })
}
